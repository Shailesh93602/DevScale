import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import { createAppError } from '../../utils/errorHandler.js';
import { battleDetailInclude, creatorSelect } from './battleShapes.js';
import { resolveBattleId } from './lock.js';
import { buildLeaderboard } from './scoring.js';

// ── Leaderboard ────────────────────────────────────────────────────────────

export async function getBattleLeaderboard(battleIdOrSlug: string) {
  const battleId = await resolveBattleId(battleIdOrSlug);
  const battle = await prisma.battle.findUnique({ where: { id: battleId } });
  if (!battle) throw createAppError('Battle not found', 404);

  if (battle.status === 'COMPLETED') {
    // Return frozen final leaderboard
    const entries = await prisma.battleLeaderboard.findMany({
      where: { battle_id: battleId },
      orderBy: { rank: 'asc' },
      include: { user: { select: creatorSelect } },
    });
    return entries.map((e) => ({
      user_id: e.user_id,
      username: e.user.username,
      avatar_url: e.user.avatar_url,
      score: e.score,
      rank: e.rank,
      correct_count: e.correct_count,
      total_time_ms: e.total_time_ms,
    }));
  }

  return buildLeaderboard(battleId);
}

// ── Results (full breakdown) ───────────────────────────────────────────────

export async function getBattleResults(battleIdOrSlug: string) {
  const battleId = await resolveBattleId(battleIdOrSlug);
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: {
      ...battleDetailInclude,
      questions: {
        orderBy: { order: 'asc' },
        include: {
          answers: {
            select: {
              user_id: true,
              selected_option: true,
              is_correct: true,
              time_taken_ms: true,
              points_earned: true,
            },
          },
        },
      },
    },
  });

  if (!battle) throw createAppError('Battle not found', 404);
  if (battle.status !== 'COMPLETED') {
    throw createAppError(
      'Results are only available after the battle ends',
      403
    );
  }

  return battle;
}

// ── My answers in a battle ────────────────────────────────────────────────

export async function getUserAnswers(battleId: string, userId: string) {
  return prisma.battleAnswer.findMany({
    where: { battle_id: battleId, user_id: userId },
    include: {
      question: {
        select: {
          question: true,
          options: true,
          correct_answer: true,
          explanation: true,
          order: true,
        },
      },
    },
    orderBy: { question: { order: 'asc' } },
  });
}

// ── Per-user post-battle results (P5.14) ─────────────────────────────────

export async function getMyResults(battleIdOrSlug: string, userId: string) {
  const battleId = await resolveBattleId(battleIdOrSlug);
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    select: { status: true, total_questions: true },
  });
  if (!battle) throw createAppError('Battle not found', 404);
  if (battle.status !== 'COMPLETED') {
    throw createAppError(
      'Results are only available after the battle ends',
      403
    );
  }

  // User's answers with question details
  const userAnswers = await prisma.battleAnswer.findMany({
    where: { battle_id: battleId, user_id: userId },
    include: {
      question: {
        select: {
          id: true,
          question: true,
          options: true,
          correct_answer: true,
          explanation: true,
          order: true,
          points: true,
        },
      },
    },
    orderBy: { question: { order: 'asc' } },
  });

  const { totalByQ, correctByQ } = await getCommunityAnswerCounts(battleId);

  // User's participant summary
  const participant = await prisma.battleParticipant.findUnique({
    where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
    select: {
      score: true,
      rank: true,
      correct_count: true,
      wrong_count: true,
      avg_time_per_answer_ms: true,
    },
  });

  return {
    summary: {
      score: participant?.score ?? 0,
      rank: participant?.rank ?? null,
      correct_count: participant?.correct_count ?? 0,
      wrong_count: participant?.wrong_count ?? 0,
      avg_time_ms: participant?.avg_time_per_answer_ms ?? 0,
      total_questions: battle.total_questions,
      answered: userAnswers.length,
    },
    questions: userAnswers.map((a) => {
      const total = totalByQ.get(a.question_id) ?? 0;
      const correct = correctByQ.get(a.question_id) ?? 0;
      return {
        order: a.question.order,
        question_text: a.question.question,
        options: a.question.options as string[],
        correct_answer: a.question.correct_answer,
        explanation: a.question.explanation ?? null,
        points: a.question.points,
        selected_option: a.selected_option,
        is_correct: a.is_correct,
        time_taken_ms: a.time_taken_ms,
        points_earned: a.points_earned,
        community_accuracy_pct:
          total > 0 ? Math.round((correct / total) * 100) : 0,
        community_total_answers: total,
      };
    }),
  };
}

// ── My battles ────────────────────────────────────────────────────────────

export async function getMyBattles(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const where: Prisma.BattleWhereInput = {
    OR: [{ user_id: userId }, { participants: { some: { user_id: userId } } }],
  };

  const [data, total] = await prisma.$transaction([
    prisma.battle.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        topic: { select: { id: true, title: true } },
        creator: { select: creatorSelect },
        participants: {
          where: { user_id: userId },
          select: { score: true, rank: true, status: true },
        },
        _count: { select: { participants: true, questions: true } },
      },
    }),
    prisma.battle.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

/** Per-question community accuracy (total + correct counts across all users). */
async function getCommunityAnswerCounts(battleId: string) {
  const [allCounts, correctCounts] = await Promise.all([
    prisma.battleAnswer.groupBy({
      by: ['question_id'],
      where: { battle_id: battleId },
      _count: { id: true },
    }),
    prisma.battleAnswer.groupBy({
      by: ['question_id'],
      where: { battle_id: battleId, is_correct: true },
      _count: { id: true },
    }),
  ]);
  return {
    totalByQ: new Map(allCounts.map((r) => [r.question_id, r._count.id])),
    correctByQ: new Map(correctCounts.map((r) => [r.question_id, r._count.id])),
  };
}
