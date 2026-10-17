import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import { createAppError } from '../../utils/errorHandler.js';
import {
  BATTLE_COMPLETE_LOCK_TTL_MS,
  BATTLE_SUBMIT_LOCK_TTL_MS,
  BATTLE_TX_MAX_WAIT_MS,
  BATTLE_TX_TIMEOUT_MS,
} from '../../utils/deadlines.js';
import { battleDetailInclude, creatorSelect } from './battleShapes.js';
import { withBattleLock } from './lock.js';
import { buildLeaderboard, calculatePoints } from './scoring.js';

// ── Submit answer ─────────────────────────────────────────────────────────

interface AnswerInput {
  battleId: string;
  questionId: string;
  userId: string;
  selectedOption: number;
  timeTakenMs: number;
}

export async function submitAnswer(
  battleId: string,
  questionId: string,
  userId: string,
  selectedOption: number,
  timeTakenMs: number
) {
  const input = { battleId, questionId, userId, selectedOption, timeTakenMs };
  return withBattleLock(
    battleId,
    // Strictly greater than maxWait + the transaction timeout below, because
    // `redlock.acquire()` never extends a lock — see deadlines.ts.
    BATTLE_SUBMIT_LOCK_TTL_MS,
    () =>
      prisma.$transaction((tx) => recordAnswer(tx, input), {
        maxWait: BATTLE_TX_MAX_WAIT_MS,
        timeout: BATTLE_TX_TIMEOUT_MS,
      }),
    // Serialize per-battle (rank recalculation touches every participant) but
    // retry so concurrent live-battle submissions queue instead of failing.
    { retryCount: 10 }
  );
}

async function recordAnswer(tx: Prisma.TransactionClient, input: AnswerInput) {
  const { battleId, userId } = input;
  await assertStillPlaying(tx, battleId, userId);
  const question = await loadAnswerableQuestion(tx, input);

  const isCorrect = question.correct_answer === input.selectedOption;
  const pointsEarned = calculatePoints(
    isCorrect,
    question.points,
    input.timeTakenMs,
    question.time_limit
  );

  const answer = await persistAnswer(tx, input, isCorrect, pointsEarned);
  const answeredCount = await updateParticipantTotals(tx, battleId, userId);

  // Recalculate ranks (tiebreaker: lower avg time = better rank)
  await recalculateRanks(tx, battleId);

  const participantDone = await markDoneIfFinished(
    tx,
    battleId,
    userId,
    answeredCount
  );

  const leaderboard = await buildLeaderboard(battleId, tx);

  return {
    answer,
    is_correct: isCorrect,
    points_earned: pointsEarned,
    correct_answer: question.correct_answer,
    explanation: question.explanation,
    participant_done: participantDone,
    leaderboard,
  };
}

// Re-checked under the lock: an answer queued behind completeBattle must not
// change a frozen leaderboard.
async function assertStillPlaying(
  tx: Prisma.TransactionClient,
  battleId: string,
  userId: string
): Promise<void> {
  const [battle, participant] = await Promise.all([
    tx.battle.findUnique({ where: { id: battleId }, select: { status: true } }),
    tx.battleParticipant.findUnique({
      where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
      select: { status: true },
    }),
  ]);
  if (battle?.status !== 'IN_PROGRESS') {
    throw createAppError('This battle is not in progress', 409);
  }
  if (!participant || participant.status === 'DISCONNECTED') {
    throw createAppError('You are not playing in this battle', 409);
  }
}

async function loadAnswerableQuestion(
  tx: Prisma.TransactionClient,
  { battleId, questionId, timeTakenMs }: AnswerInput
) {
  const question = await tx.battleQuestion.findUnique({
    where: { id: questionId },
  });
  if (question?.battle_id !== battleId) {
    throw createAppError('Invalid question', 400);
  }

  // Reject answers submitted well after the time limit (2-second network grace period)
  const timeLimit = question?.time_limit ?? 0;
  const maxAllowedMs = timeLimit * 1000 + 2000;
  if (timeTakenMs > maxAllowedMs) {
    throw createAppError('Answer submitted after the time limit', 400);
  }
  return question;
}

async function persistAnswer(
  tx: Prisma.TransactionClient,
  { battleId, questionId, userId, selectedOption, timeTakenMs }: AnswerInput,
  isCorrect: boolean,
  pointsEarned: number
) {
  // One answer per (question, user) — enforced by a unique index; a double-tap
  // is a client mistake, so answer 409 rather than leak the raw Prisma error.
  const alreadyAnswered = await tx.battleAnswer.findUnique({
    where: {
      question_id_user_id: { question_id: questionId, user_id: userId },
    },
    select: { id: true },
  });
  if (alreadyAnswered) {
    throw createAppError('You have already answered this question', 409);
  }

  return tx.battleAnswer
    .create({
      data: {
        battle_id: battleId,
        question_id: questionId,
        user_id: userId,
        selected_option: selectedOption,
        is_correct: isCorrect,
        time_taken_ms: timeTakenMs,
        points_earned: pointsEarned,
      },
    })
    .catch((err: { code?: string }) => {
      if (err?.code === 'P2002') {
        throw createAppError('You have already answered this question', 409);
      }
      throw err;
    });
}

/** Recomputes the participant's score/accuracy/time; returns answers so far. */
async function updateParticipantTotals(
  tx: Prisma.TransactionClient,
  battleId: string,
  userId: string
): Promise<number> {
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
  return answeredCount;
}

async function markDoneIfFinished(
  tx: Prisma.TransactionClient,
  battleId: string,
  userId: string,
  answeredCount: number
): Promise<boolean> {
  const battle = await tx.battle.findUnique({
    where: { id: battleId },
    select: { total_questions: true },
  });
  const totalQuestions = battle?.total_questions || 0;
  const done = answeredCount >= totalQuestions;

  if (done) {
    await tx.battleParticipant.update({
      where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
      data: { status: 'COMPLETED', completed_at: new Date() },
    });
  }
  return done;
}

async function recalculateRanks(
  tx: Prisma.TransactionClient,
  battleId: string
): Promise<void> {
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
}

// ── Check battle completion ───────────────────────────────────────────────

/**
 * Returns true if all participants have completed all questions.
 * Used after every answer submission to decide whether to fire battle:completed.
 */
export async function checkAllParticipantsDone(
  battleId: string
): Promise<boolean> {
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

/**
 * 🔴 SERIALIZING IS NOT DEDUPLICATING.
 *
 * This took the lock and then unconditionally wrote COMPLETED, a fresh
 * `ended_at` and the entire final leaderboard, with no check that it had
 * already run. The lock made two completions sequential; it did not make the
 * second one a no-op.
 *
 * That mattered because of what the caller does next. `battleSocket.endBattle`
 * calls this and then `battleRatingService.applyBattleResult`, which is built
 * on `games_played: { increment: 1 }` and `wins/losses: { increment }` and
 * recomputes Elo from each player's CURRENT rating. A second completion
 * therefore does not repeat work harmlessly — it applies a second Elo delta on
 * top of the first and inflates everyone's game counts.
 *
 * And the second completion is the normal case, not an exotic one. Two paths
 * reach `endBattle`: the answer-submitted handler and the question-expiry
 * timer. Both call `checkAllParticipantsDone` — a DB round trip — and only
 * then clear the timer, so the timer can fire inside that window. In a
 * two-player battle where both players answer the last question at about the
 * same time, both submissions also see "everyone is done" and both call
 * `endBattle`.
 *
 * The transition is now a compare-and-set, and the result reports whether
 * this call was the one that performed it. `endBattle` uses that to apply
 * ratings exactly once.
 */
export async function completeBattle(battleId: string) {
  return withBattleLock(battleId, BATTLE_COMPLETE_LOCK_TTL_MS, async () => {
    const existing = await prisma.battle.findUnique({
      where: { id: battleId },
      include: battleDetailInclude,
    });
    if (!existing) throw createAppError('Battle not found', 404);

    if (existing.status === 'COMPLETED') {
      // Already finished. Hand back the frozen result without rewriting it,
      // and tell the caller it must not apply ratings again.
      return {
        battle: existing,
        leaderboard: await buildLeaderboard(battleId),
        alreadyCompleted: true as const,
      };
    }

    const participants = await prisma.battleParticipant.findMany({
      where: { battle_id: battleId },
      orderBy: [{ score: 'desc' }, { avg_time_per_answer_ms: 'asc' }],
      include: { user: { select: creatorSelect } },
    });

    const winnerId = participants[0]?.user_id ?? null;

    // Compare-and-set: correct even if the lock lapsed mid-flight.
    const claimed = await prisma.battle.updateMany({
      where: { id: battleId, status: { not: 'COMPLETED' } },
      data: {
        status: 'COMPLETED',
        ended_at: new Date(),
        winner_id: winnerId,
      },
    });
    if (claimed.count === 0) {
      return {
        battle: await prisma.battle.findUniqueOrThrow({
          where: { id: battleId },
          include: battleDetailInclude,
        }),
        leaderboard: await buildLeaderboard(battleId),
        alreadyCompleted: true as const,
      };
    }

    const battle = await prisma.battle.findUniqueOrThrow({
      where: { id: battleId },
      include: battleDetailInclude,
    });

    await writeFinalLeaderboard(battleId, participants);

    return {
      battle,
      leaderboard: await buildLeaderboard(battleId),
      alreadyCompleted: false as const,
    };
  });
}

type FinalParticipant = {
  user_id: string;
  score: number;
  correct_count: number;
};

/** Upserts the frozen leaderboard; participants arrive already ranked. */
async function writeFinalLeaderboard(
  battleId: string,
  participants: FinalParticipant[]
): Promise<void> {
  // N+1 Optimization: Get all answers in one go
  const allAnswers = await prisma.battleAnswer.findMany({
    where: { battle_id: battleId },
    select: { user_id: true, time_taken_ms: true },
  });

  const timeByUser = allAnswers.reduce(
    (acc, a) => {
      acc[a.user_id] = (acc[a.user_id] || 0) + a.time_taken_ms;
      return acc;
    },
    {} as Record<string, number>
  );

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    const row = {
      score: p.score,
      rank: i + 1,
      correct_count: p.correct_count,
      total_time_ms: timeByUser[p.user_id] || 0,
    };
    await prisma.battleLeaderboard.upsert({
      where: {
        battle_id_user_id: { battle_id: battleId, user_id: p.user_id },
      },
      create: { battle_id: battleId, user_id: p.user_id, ...row },
      update: row,
    });
  }
}
