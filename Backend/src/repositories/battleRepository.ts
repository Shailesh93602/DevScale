import { BattleStatus, BattleType, Difficulty, PrismaClient, Prisma } from '@prisma/client';
import BaseRepository from './baseRepository';
import { createAppError } from '../utils/errorHandler';
import prisma from '../lib/prisma';
import logger from '../utils/logger';
import { generateBattleSlug, isUuid } from '../utils/slugify';
import { getCached, setCached, invalidatePattern } from '../services/memoryCache';

// ─── Public selector shapes ────────────────────────────────────────────────

const creatorSelect = {
  id: true,
  username: true,
  avatar_url: true,
  first_name: true,
  last_name: true,
} as const;

const participantInclude = {
  user: { select: creatorSelect },
} as const;

const battleDetailInclude = {
  topic: { select: { id: true, title: true } },
  creator: { select: creatorSelect },
  winner: { select: creatorSelect },
  participants: {
    include: participantInclude,
    orderBy: { score: 'desc' as const },
  },
  _count: { select: { questions: true, participants: true } },
} as const;

// ─── Query parameter types ─────────────────────────────────────────────────

export interface BattleListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BattleStatus;
  difficulty?: Difficulty;
  type?: BattleType;
  topic_id?: string;
  user_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

interface BattleListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Scoring helper ────────────────────────────────────────────────────────

/**
 * Calculate points earned for a correct answer based on speed.
 * Speed bonus tiers (based on fraction of time limit used):
 *   ≤25% → +50%   (×1.5)
 *   ≤50% → +25%   (×1.25)
 *   ≤75% → ±0%    (×1.0)
 *   ≤100% → -25%  (×0.75)
 * Wrong answers always score 0.
 */
export function calculatePoints(
  isCorrect: boolean,
  basePoints: number,
  timeTakenMs: number,
  timeLimitSeconds: number
): number {
  if (!isCorrect) return 0;
  const timeLimitMs = timeLimitSeconds * 1000;
  const fraction = Math.min(timeTakenMs / timeLimitMs, 1);

  let multiplier: number;
  if (fraction <= 0.25) multiplier = 1.5;
  else if (fraction <= 0.5) multiplier = 1.25;
  else if (fraction <= 0.75) multiplier = 1.0;
  else multiplier = 0.75;

  return Math.floor(basePoints * multiplier);
}

// ─── Leaderboard helper ────────────────────────────────────────────────────

async function buildLeaderboard(battleId: string) {
  const participants = await prisma.battleParticipant.findMany({
    where: { battle_id: battleId },
    include: { user: { select: creatorSelect } },
    orderBy: [{ score: 'desc' }, { avg_time_per_answer_ms: 'asc' }],
  });

  return participants.map((p, idx) => ({
    user_id: p.user_id,
    username: p.user.username,
    avatar_url: p.user.avatar_url,
    score: p.score,
    rank: idx + 1,
    correct_count: p.correct_count,
    total_time_ms: p.avg_time_per_answer_ms * (p.correct_count + p.wrong_count),
  }));
}

// ─── Repository ────────────────────────────────────────────────────────────

export class BattleRepository extends BaseRepository<PrismaClient['battle']> {
  constructor() {
    super(prisma.battle);
  }

  // ── ID resolver (UUID or slug → UUID) ────────────────────────────────────

  private async resolveId(idOrSlug: string): Promise<string> {
    if (isUuid(idOrSlug)) return idOrSlug;
    const battle = await prisma.battle.findFirst({
      where: { slug: idOrSlug },
      select: { id: true },
    });
    if (!battle) throw createAppError('Battle not found', 404);
    return battle.id;
  }

  // ── Browse ──────────────────────────────────────────────────────────────

  /**
   * Global aggregate stats for the Battle Zone header bar.
   * Single SQL query instead of fetching 100 full battle objects.
   * Cached 30s — fresh enough for a live counter.
   */
  async getGlobalStats(): Promise<{ activeBattles: number; upcomingBattles: number; totalParticipants: number }> {
    const cacheKey = 'battles:global-stats';
    const cached = getCached<{ activeBattles: number; upcomingBattles: number; totalParticipants: number }>(cacheKey);
    if (cached) return cached;

    const [row] = await prisma.$queryRaw<[{ active: number; upcoming: number; total_participants: bigint }]>`
      SELECT
        COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')::int          AS active,
        COUNT(*) FILTER (WHERE status IN ('WAITING', 'LOBBY'))::int  AS upcoming,
        COALESCE(SUM(current_participants), 0)::bigint               AS total_participants
      FROM "Battle"
    `;

    const stats = {
      activeBattles: row.active,
      upcomingBattles: row.upcoming,
      totalParticipants: Number(row.total_participants),
    };

    setCached(cacheKey, stats, 30);
    return stats;
  }

  async getBattles(params: BattleListParams): Promise<{ data: unknown[]; meta: BattleListMeta }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const skip = (page - 1) * limit;

    // Cache key encodes all list params — stable across concurrent identical requests
    const cacheKey = `battles:list:p${page}:l${limit}:s${params.search || ''}:st${params.status || ''}:d${params.difficulty || ''}:t${params.type || ''}:tp${params.topic_id || ''}:u${params.user_id || ''}:sb${params.sort_by || ''}:so${params.sort_order || ''}`;
    const cachedList = getCached<{ data: unknown[]; meta: BattleListMeta }>(cacheKey);
    if (cachedList) return cachedList;

    const where: Prisma.BattleWhereInput = {};

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.status) where.status = params.status;
    if (params.difficulty) where.difficulty = params.difficulty;
    if (params.type) where.type = params.type;
    if (params.topic_id) where.topic_id = params.topic_id;
    if (params.user_id) where.user_id = params.user_id;

    const allowedSortFields = ['created_at', 'start_time', 'current_participants', 'title'];
    const sortField = allowedSortFields.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    const sortOrder = params.sort_order === 'asc' ? 'asc' : 'desc';

    const [data, total] = await prisma.$transaction([
      prisma.battle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          topic: { select: { id: true, title: true } },
          creator: { select: creatorSelect },
          _count: { select: { participants: true, questions: true } },
        },
      }),
      prisma.battle.count({ where }),
    ]);

    const result = {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
    setCached(cacheKey, result, 30); // 30s TTL
    return result;
  }

  /** Invalidate battle list and global-stats caches (call after create/join/cancel). */
  invalidateBattleListCache(): void {
    invalidatePattern('battles:list:');
    invalidatePattern('battles:global-stats');
  }

  // ── Detail ──────────────────────────────────────────────────────────────

  async getBattleDetails(idOrSlug: string) {
    const battle = isUuid(idOrSlug)
      ? await prisma.battle.findUnique({ where: { id: idOrSlug }, include: battleDetailInclude })
      : await prisma.battle.findFirst({ where: { slug: idOrSlug }, include: battleDetailInclude });

    if (!battle) throw createAppError('Battle not found', 404);
    return battle;
  }

  // ── Create ──────────────────────────────────────────────────────────────

  async createBattle(data: {
    title: string;
    description?: string;
    type: BattleType;
    topic_id?: string | null;
    difficulty: Difficulty;
    max_participants: number;
    total_questions: number;
    time_per_question: number;
    points_per_question: number;
    start_time?: Date;
    user_id: string;
    question_source_type?: string | null;
    question_source_id?: string | null;
  }) {
    const battle = await prisma.battle.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        topic_id: data.topic_id ?? null,
        difficulty: data.difficulty,
        max_participants: data.max_participants,
        total_questions: data.total_questions,
        time_per_question: data.time_per_question,
        points_per_question: data.points_per_question,
        start_time: data.start_time,
        status: 'WAITING',
        user_id: data.user_id,
        question_source_type: data.question_source_type ?? null,
        question_source_id: data.question_source_id ?? null,
      },
      include: battleDetailInclude,
    });

    // Generate and store the slug now that we have the ID
    const slug = generateBattleSlug(battle.title, battle.id);
    await prisma.battle.update({ where: { id: battle.id }, data: { slug } });

    this.invalidateBattleListCache();
    return { ...battle, slug };
  }

  /**
   * Bulk-insert questions sourced from the question pool (auto-seeding).
   * Called by the controller right after createBattle when question_source is provided.
   */
  async addQuestionsFromPool(
    battleId: string,
    questions: {
      source_quiz_question_id: string | null;
      source_challenge_id: string | null;
      question: string;
      options: string[];
      correct_answer: number;
      explanation: string | null;
      points: number;
      time_limit: number;
    }[],
  ) {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      select: { points_per_question: true, time_per_question: true },
    });
    if (!battle) throw createAppError('Battle not found', 404);

    await prisma.battleQuestion.createMany({
      data: questions.map((q, idx) => ({
        battle_id: battleId,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        points: battle.points_per_question,
        time_limit: battle.time_per_question,
        order: idx + 1,
        source_quiz_question_id: q.source_quiz_question_id,
        source_challenge_id: q.source_challenge_id,
      })),
    });
  }

  // ── Join ────────────────────────────────────────────────────────────────

  async joinBattle(battleIdOrSlug: string, userId: string) {
    const battleId = await this.resolveId(battleIdOrSlug);
    return prisma.$transaction(async (tx) => {
      const battle = await tx.battle.findUnique({ where: { id: battleId } });
      if (!battle) throw createAppError('Battle not found', 404);
      if (battle.status !== 'WAITING' && battle.status !== 'LOBBY') {
        throw createAppError('Cannot join — battle has already started or ended', 403);
      }
      if (battle.current_participants >= battle.max_participants) {
        throw createAppError('Battle is full', 403);
      }

      // Guard: reject if already enrolled
      const existingParticipant = await tx.battleParticipant.findUnique({
        where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
      });
      if (existingParticipant) {
        throw createAppError('You are already enrolled in this battle', 409);
      }

      const participant = await tx.battleParticipant.create({
        data: { battle_id: battleId, user_id: userId, status: 'JOINED' },
        include: { user: { select: creatorSelect } },
      });

      const updated = await tx.battle.update({
        where: { id: battleId },
        data: { current_participants: { increment: 1 } },
        include: battleDetailInclude,
      });

      return { participant, battle: updated };
    }, { timeout: 15_000 });
  }

  // ── Leave ────────────────────────────────────────────────────────────────

  async leaveBattle(battleIdOrSlug: string, userId: string) {
    const battleId = await this.resolveId(battleIdOrSlug);
    return prisma.$transaction(async (tx) => {
      const participant = await tx.battleParticipant.findUnique({
        where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
      });
      if (!participant) throw createAppError('You are not in this battle', 404);

      const battle = await tx.battle.findUnique({ where: { id: battleId } });
      if (battle?.status === 'IN_PROGRESS') {
        // Mark as disconnected rather than removing
        await tx.battleParticipant.update({
          where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
          data: { status: 'DISCONNECTED', last_seen_at: new Date() },
        });
        return tx.battle.findUnique({ where: { id: battleId } });
      }

      await tx.battleParticipant.delete({
        where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
      });

      return tx.battle.update({
        where: { id: battleId },
        data: { current_participants: { decrement: 1 } },
      });
    }, { timeout: 15_000 });
  }

  // ── Ready ────────────────────────────────────────────────────────────────

  async markReady(battleIdOrSlug: string, userId: string) {
    const battleId = await this.resolveId(battleIdOrSlug);
    const participant = await prisma.battleParticipant.findUnique({
      where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
    });
    if (!participant) throw createAppError('You are not in this battle', 404);
    if (participant.status === 'READY') return participant;

    return prisma.battleParticipant.update({
      where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
      data: { status: 'READY' },
      include: { user: { select: creatorSelect } },
    });
  }

  // ── Start ────────────────────────────────────────────────────────────────

  async startBattle(battleIdOrSlug: string, userId: string) {
    const battleId = await this.resolveId(battleIdOrSlug);
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        participants: true,
        _count: { select: { questions: true } },
      },
    });
    if (!battle) throw createAppError('Battle not found', 404);
    if (battle.user_id !== userId) throw createAppError('Only the creator can start this battle', 403);
    if (battle.status !== 'LOBBY') throw createAppError('Battle must be in LOBBY state to start', 400);
    if (battle.current_participants < 2) throw createAppError('Need at least 2 participants to start', 400);

    const readyCount = battle.participants.filter((p) => p.status === 'READY').length;
    if (readyCount < battle.current_participants) {
      throw createAppError('Not all participants are ready', 400);
    }

    // Guard: cannot start without the required number of questions
    if (battle._count.questions < battle.total_questions) {
      throw createAppError(
        `Battle needs ${battle.total_questions} questions but only has ${battle._count.questions}. Add questions before starting.`,
        400
      );
    }

    return prisma.battle.update({
      where: { id: battleId },
      data: { status: 'IN_PROGRESS' },
      include: battleDetailInclude,
    });
  }

  // ── Cancel ────────────────────────────────────────────────────────────────

  async cancelBattle(battleIdOrSlug: string, userId: string) {
    const battleId = await this.resolveId(battleIdOrSlug);
    const battle = await prisma.battle.findUnique({ where: { id: battleId } });
    if (!battle) throw createAppError('Battle not found', 404);
    if (battle.user_id !== userId) throw createAppError('Only the creator can cancel this battle', 403);
    if (battle.status === 'IN_PROGRESS' || battle.status === 'COMPLETED') {
      throw createAppError('Cannot cancel a battle that has already started or completed', 400);
    }
    if (battle.status === 'CANCELLED') throw createAppError('Battle is already cancelled', 400);

    return prisma.battle.update({
      where: { id: battleId },
      data: { status: 'CANCELLED' },
    });
  }

  // ── Questions ────────────────────────────────────────────────────────────

  /**
   * Returns questions WITHOUT correct_answer — safe to send to client.
   * correct_answer is only sent in the answer result payload.
   */
  async getBattleQuestions(battleIdOrSlug: string, userId: string) {
    const battleId = await this.resolveId(battleIdOrSlug);
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        participants: { where: { user_id: userId } },
        questions: { orderBy: { order: 'asc' } },
      },
    });

    if (!battle) throw createAppError('Battle not found', 404);
    if (battle.status !== 'IN_PROGRESS') {
      throw createAppError('Questions are only available during an active battle', 403);
    }
    if (!battle.participants.length) {
      throw createAppError('You are not a participant in this battle', 403);
    }

    // Strip correct_answer before sending
    return battle.questions.map(({ correct_answer: _ca, explanation: _exp, ...q }) => q);
  }

  // ── Add questions (creator only, before battle starts) ───────────────────

  async addQuestions(
    battleIdOrSlug: string,
    userId: string,
    questions: Array<{
      question: string;
      options: string[];
      correct_answer: number;
      explanation?: string;
      points?: number;
      time_limit?: number;
    }>
  ) {
    const battleId = await this.resolveId(battleIdOrSlug);
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: { _count: { select: { questions: true } } },
    });
    if (!battle) throw createAppError('Battle not found', 404);
    if (battle.user_id !== userId) throw createAppError('Only the creator can add questions', 403);
    if (['IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(battle.status)) {
      throw createAppError('Cannot add questions to a battle that has already started or ended', 400);
    }

    const existingCount = battle._count.questions;
    const remaining = battle.total_questions - existingCount;
    if (remaining <= 0) {
      throw createAppError(
        `Battle already has ${existingCount} questions (required: ${battle.total_questions}). No more needed.`,
        400
      );
    }
    if (questions.length > remaining) {
      throw createAppError(
        `Battle needs ${remaining} more question(s) but you are adding ${questions.length}. Maximum: ${battle.total_questions} total.`,
        400
      );
    }

    const data = questions.map((q, i) => ({
      battle_id: battleId,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation ?? null,
      points: q.points ?? battle.points_per_question,
      time_limit: q.time_limit ?? battle.time_per_question,
      order: existingCount + i + 1,
    }));

    await prisma.battleQuestion.createMany({ data });

    const totalAdded = existingCount + questions.length;
    return {
      added: questions.length,
      total_questions_added: totalAdded,
      total_questions_required: battle.total_questions,
      ready_to_start: totalAdded >= battle.total_questions,
    };
  }

  // ── Submit answer ─────────────────────────────────────────────────────────

  async submitAnswer(
    battleId: string,
    questionId: string,
    userId: string,
    selectedOption: number,
    timeTakenMs: number
  ) {
    const txResult = await prisma.$transaction(async (tx) => {
      const question = await tx.battleQuestion.findUnique({
        where: { id: questionId },
      });
      if (!question || question.battle_id !== battleId) {
        throw createAppError('Invalid question', 400);
      }

      // Reject answers submitted well after the time limit (2-second network grace period)
      const maxAllowedMs = question.time_limit * 1000 + 2000;
      if (timeTakenMs > maxAllowedMs) {
        throw createAppError('Answer submitted after the time limit', 400);
      }

      const isCorrect = question.correct_answer === selectedOption;
      const pointsEarned = calculatePoints(isCorrect, question.points, timeTakenMs, question.time_limit);

      // Persist the answer
      const answer = await tx.battleAnswer.create({
        data: {
          battle_id: battleId,
          question_id: questionId,
          user_id: userId,
          selected_option: selectedOption,
          is_correct: isCorrect,
          time_taken_ms: timeTakenMs,
          points_earned: pointsEarned,
        },
      });

      // Update participant totals
      const answeredCount = await tx.battleAnswer.count({
        where: { battle_id: battleId, user_id: userId },
      });

      const allAnswers = await tx.battleAnswer.findMany({
        where: { battle_id: battleId, user_id: userId },
        select: { time_taken_ms: true, is_correct: true, points_earned: true },
      });

      const totalScore = allAnswers.reduce((sum, a) => sum + a.points_earned, 0);
      const correctCount = allAnswers.filter((a) => a.is_correct).length;
      const wrongCount = allAnswers.filter((a) => !a.is_correct).length;
      const avgTimeMs = Math.floor(
        allAnswers.reduce((sum, a) => sum + a.time_taken_ms, 0) / allAnswers.length
      );

      await tx.battleParticipant.update({
        where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
        data: {
          score: totalScore,
          correct_count: correctCount,
          wrong_count: wrongCount,
          avg_time_per_answer_ms: avgTimeMs,
        },
      });

      // Recalculate ranks (tiebreaker: lower avg time = better rank)
      const allParticipants = await tx.battleParticipant.findMany({
        where: { battle_id: battleId },
        orderBy: [{ score: 'desc' }, { avg_time_per_answer_ms: 'asc' }],
      });

      for (let i = 0; i < allParticipants.length; i++) {
        await tx.battleParticipant.update({
          where: { id: allParticipants[i].id },
          data: { rank: i + 1 },
        });
      }

      // Check if this participant has finished all questions
      const battle = await tx.battle.findUnique({
        where: { id: battleId },
      });
      const totalQuestions = battle?.total_questions || 0;

      if (answeredCount >= totalQuestions) {
        await tx.battleParticipant.update({
          where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
          data: { status: 'COMPLETED', completed_at: new Date() },
        });
      }

      return {
        answer,
        is_correct: isCorrect,
        points_earned: pointsEarned,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        participant_done: answeredCount >= totalQuestions,
      };
    }, { timeout: 15_000 });

    // Build leaderboard outside the transaction to avoid holding the connection open
    const leaderboard = await buildLeaderboard(battleId);

    return { ...txResult, leaderboard };
  }

  // ── Check battle completion ───────────────────────────────────────────────

  /**
   * Returns true if all participants have completed all questions.
   * Used after every answer submission to decide whether to fire battle:completed.
   */
  async checkAllParticipantsDone(battleId: string): Promise<boolean> {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        participants: true,
        _count: { select: { questions: true } },
      },
    });
    if (!battle) return false;
    if (battle.participants.length === 0) return false;

    const activePlayers = battle.participants.filter(
      (p) => p.status !== 'DISCONNECTED'
    );
    if (activePlayers.length === 0) return false;

    return activePlayers.every((p) => p.status === 'COMPLETED');
  }

  // ── Complete battle ───────────────────────────────────────────────────────

  async completeBattle(battleId: string) {
    const participants = await prisma.battleParticipant.findMany({
      where: { battle_id: battleId },
      orderBy: [{ score: 'desc' }, { avg_time_per_answer_ms: 'asc' }],
      include: { user: { select: creatorSelect } },
    });

    const winnerId = participants[0]?.user_id ?? null;

    const battle = await prisma.battle.update({
      where: { id: battleId },
      data: { status: 'COMPLETED', ended_at: new Date(), winner_id: winnerId },
      include: battleDetailInclude,
    });

    // Upsert final leaderboard records
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      const totalAnswers = await prisma.battleAnswer.count({
        where: { battle_id: battleId, user_id: p.user_id },
      });
      const totalTimeMs = await prisma.battleAnswer.aggregate({
        where: { battle_id: battleId, user_id: p.user_id },
        _sum: { time_taken_ms: true },
      });

      await prisma.battleLeaderboard.upsert({
        where: { battle_id_user_id: { battle_id: battleId, user_id: p.user_id } },
        create: {
          battle_id: battleId,
          user_id: p.user_id,
          score: p.score,
          rank: i + 1,
          correct_count: p.correct_count,
          total_time_ms: totalTimeMs._sum.time_taken_ms || 0,
        },
        update: {
          score: p.score,
          rank: i + 1,
          correct_count: p.correct_count,
          total_time_ms: totalTimeMs._sum.time_taken_ms || 0,
        },
      });

      void totalAnswers; // used for logging only
    }

    return { battle, leaderboard: await buildLeaderboard(battleId) };
  }

  // ── Leaderboard ────────────────────────────────────────────────────────────

  async getBattleLeaderboard(battleIdOrSlug: string) {
    const battleId = await this.resolveId(battleIdOrSlug);
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

  async getBattleResults(battleIdOrSlug: string) {
    const battleId = await this.resolveId(battleIdOrSlug);
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
      throw createAppError('Results are only available after the battle ends', 403);
    }

    return battle;
  }

  // ── My answers in a battle ────────────────────────────────────────────────

  async getUserAnswers(battleId: string, userId: string) {
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

  async getMyResults(battleIdOrSlug: string, userId: string) {
    const battleId = await this.resolveId(battleIdOrSlug);
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      select: { status: true, total_questions: true },
    });
    if (!battle) throw createAppError('Battle not found', 404);
    if (battle.status !== 'COMPLETED') {
      throw createAppError('Results are only available after the battle ends', 403);
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

    // Per-question community accuracy (total + correct counts across all users)
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
    const totalByQ = new Map(allCounts.map((r) => [r.question_id, r._count.id]));
    const correctByQ = new Map(correctCounts.map((r) => [r.question_id, r._count.id]));

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
          community_accuracy_pct: total > 0 ? Math.round((correct / total) * 100) : 0,
          community_total_answers: total,
        };
      }),
    };
  }

  // ── My battles ────────────────────────────────────────────────────────────

  async getMyBattles(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: Prisma.BattleWhereInput = {
      OR: [
        { user_id: userId },
        { participants: { some: { user_id: userId } } },
      ],
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

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ── User statistics ───────────────────────────────────────────────────────

  async getUserStats(userId: string, timeframe?: string) {
    // Determine date filter
    let since: Date | undefined;
    const now = new Date();
    if (timeframe === 'this-week') {
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    } else if (timeframe === 'this-month') {
      since = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeframe === 'this-year') {
      since = new Date(now.getFullYear(), 0, 1);
    }

    const participationWhere = {
      user_id: userId,
      ...(since ? { joined_at: { gte: since } } : {}),
    };

    const participations = await prisma.battleParticipant.findMany({
      where: participationWhere,
      include: {
        battle: {
          select: {
            id: true,
            title: true,
            status: true,
            winner_id: true,
            difficulty: true,
            topic: { select: { id: true, title: true } },
            ended_at: true,
            created_at: true,
          },
        },
      },
      orderBy: { joined_at: 'desc' },
    });

    const completed = participations.filter((p) => p.battle.status === 'COMPLETED');
    const wins = completed.filter((p) => p.battle.winner_id === userId).length;
    const totalScore = completed.reduce((sum, p) => sum + p.score, 0);
    const correctAnswers = completed.reduce((sum, p) => sum + p.correct_count, 0);
    const totalAnswers = completed.reduce((sum, p) => sum + p.correct_count + p.wrong_count, 0);
    const avgTimeMs = totalAnswers > 0
      ? Math.round(completed.reduce((sum, p) => sum + p.avg_time_per_answer_ms * (p.correct_count + p.wrong_count), 0) / totalAnswers)
      : 0;

    // Recent 10 battles
    const recentBattles = participations.slice(0, 10).map((p) => ({
      id: p.battle.id,
      title: p.battle.title,
      status: p.battle.status,
      result: p.battle.status === 'COMPLETED'
        ? (p.battle.winner_id === userId ? 'won' : p.battle.winner_id === null ? 'draw' : 'lost')
        : p.battle.status.toLowerCase(),
      score: p.score,
      rank: p.rank,
      difficulty: p.battle.difficulty,
      topic: p.battle.topic?.title ?? null,
      ended_at: p.battle.ended_at,
    }));

    // Performance by difficulty
    const difficultyMap = new Map<string, { wins: number; total: number; score: number }>();
    for (const p of completed) {
      const d = p.battle.difficulty;
      const entry = difficultyMap.get(d) ?? { wins: 0, total: 0, score: 0 };
      entry.total += 1;
      if (p.battle.winner_id === userId) entry.wins += 1;
      entry.score += p.score;
      difficultyMap.set(d, entry);
    }
    const performanceByDifficulty = Array.from(difficultyMap.entries()).map(([difficulty, v]) => ({
      difficulty,
      battles: v.total,
      wins: v.wins,
      win_rate: v.total > 0 ? Math.round((v.wins / v.total) * 100) : 0,
      avg_score: v.total > 0 ? Math.round(v.score / v.total) : 0,
    }));

    // Performance by topic
    const topicMap = new Map<string, { name: string; wins: number; total: number; score: number }>();
    for (const p of completed) {
      const topicId = p.battle.topic?.id ?? 'unknown';
      const topicName = p.battle.topic?.title ?? 'Unknown';
      const entry = topicMap.get(topicId) ?? { name: topicName, wins: 0, total: 0, score: 0 };
      entry.total += 1;
      if (p.battle.winner_id === userId) entry.wins += 1;
      entry.score += p.score;
      topicMap.set(topicId, entry);
    }
    const performanceByTopic = Array.from(topicMap.entries())
      .map(([topic_id, v]) => ({
        topic_id,
        topic: v.name,
        battles: v.total,
        wins: v.wins,
        win_rate: v.total > 0 ? Math.round((v.wins / v.total) * 100) : 0,
        avg_score: v.total > 0 ? Math.round(v.score / v.total) : 0,
      }))
      .sort((a, b) => b.battles - a.battles);

    // Top topics (by count)
    const topTopics = performanceByTopic.slice(0, 5);

    // Performance over time (last 8 weeks, grouped by week)
    const eightWeeksAgo = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000);
    const recentCompleted = completed.filter(
      (p) => p.battle.ended_at && p.battle.ended_at >= eightWeeksAgo
    );
    const weekMap = new Map<string, { wins: number; total: number; score: number }>();
    for (const p of recentCompleted) {
      if (!p.battle.ended_at) continue;
      const d = p.battle.ended_at;
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      const entry = weekMap.get(key) ?? { wins: 0, total: 0, score: 0 };
      entry.total += 1;
      if (p.battle.winner_id === userId) entry.wins += 1;
      entry.score += p.score;
      weekMap.set(key, entry);
    }
    const performanceOverTime = Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, v]) => ({
        week,
        battles: v.total,
        wins: v.wins,
        avg_score: v.total > 0 ? Math.round(v.score / v.total) : 0,
      }));

    return {
      // Core summary
      total_battles: participations.length,
      completed_battles: completed.length,
      wins,
      win_rate: completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0,
      total_score: totalScore,
      accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
      // Detailed stats
      questions_answered: totalAnswers,
      correct_answers: correctAnswers,
      avg_time_ms: avgTimeMs,
      // Lists
      recent_battles: recentBattles,
      top_topics: topTopics,
      performance_by_difficulty: performanceByDifficulty,
      performance_by_topic: performanceByTopic,
      performance_over_time: performanceOverTime,
    };
  }

  // ── Status transition ─────────────────────────────────────────────────────

  async updateStatus(battleIdOrSlug: string, userId: string, newStatus: BattleStatus) {
    const battleId = await this.resolveId(battleIdOrSlug);
    const battle = await prisma.battle.findUnique({ where: { id: battleId } });
    if (!battle) throw createAppError('Battle not found', 404);
    if (battle.user_id !== userId) throw createAppError('Only the creator can update battle status', 403);

    const allowed: Record<string, string[]> = {
      WAITING: ['LOBBY', 'CANCELLED'],
      LOBBY: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!allowed[battle.status]?.includes(newStatus)) {
      throw createAppError(`Invalid transition: ${battle.status} → ${newStatus}`, 400);
    }

    return prisma.battle.update({
      where: { id: battleId },
      data: {
        status: newStatus,
        ...(newStatus === 'COMPLETED' ? { ended_at: new Date() } : {}),
      },
    });
  }
}
