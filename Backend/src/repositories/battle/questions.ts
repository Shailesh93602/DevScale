import { BattleType, Difficulty } from '../../constants/enums';
import prisma from '../../lib/prisma.js';
import { createAppError } from '../../utils/errorHandler.js';
import { generateBattleSlug } from '../../utils/slugify.js';
import { battleDetailInclude, type BattleDetail } from './battleShapes.js';
import { invalidateBattleListCache } from './browse.js';
import { resolveBattleId } from './lock.js';

type PoolQuestionInput = {
  source_quiz_question_id: string | null;
  source_challenge_id: string | null;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  points: number;
  time_limit: number;
};

// ── Create ──────────────────────────────────────────────────────────────

export async function createBattle(data: {
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
  /**
   * Seated and seeded in the same INSERT as the battle (ranked matchmaking):
   * nobody can take a matched player's seat, and the battle is startable.
   */
  participant_ids?: string[];
  pool_questions?: PoolQuestionInput[];
}): Promise<BattleDetail & { slug: string }> {
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
      ...(data.participant_ids && {
        current_participants: data.participant_ids.length,
        participants: {
          create: data.participant_ids.map((user_id) => ({
            user_id,
            status: 'JOINED',
          })),
        },
      }),
      ...(data.pool_questions && {
        questions: {
          create: data.pool_questions.map((q, idx) => ({
            question: q.question,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            points: data.points_per_question,
            time_limit: data.time_per_question,
            order: idx + 1,
            source_quiz_question_id: q.source_quiz_question_id,
            source_challenge_id: q.source_challenge_id,
          })),
        },
      }),
    },
    include: battleDetailInclude,
  });

  // Generate and store the slug now that we have the ID
  const slug = generateBattleSlug(battle.title, battle.id);
  await prisma.battle.update({ where: { id: battle.id }, data: { slug } });

  invalidateBattleListCache();
  return { ...battle, slug };
}

/**
 * Bulk-insert questions sourced from the question pool (auto-seeding).
 * Called by the controller right after createBattle when question_source is provided.
 */
export async function addQuestionsFromPool(
  battleId: string,
  questions: PoolQuestionInput[]
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

// ── Questions ────────────────────────────────────────────────────────────

/**
 * Returns questions WITHOUT correct_answer — safe to send to client.
 * correct_answer is only sent in the answer result payload.
 */
export async function getBattleQuestions(
  battleIdOrSlug: string,
  userId: string
) {
  const battleId = await resolveBattleId(battleIdOrSlug);
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: {
      participants: { where: { user_id: userId } },
      questions: { orderBy: { order: 'asc' } },
    },
  });

  if (!battle) throw createAppError('Battle not found', 404);
  if (battle.status !== 'IN_PROGRESS') {
    throw createAppError(
      'Questions are only available during an active battle',
      403
    );
  }
  if (!battle.participants.length) {
    throw createAppError('You are not a participant in this battle', 403);
  }

  // Strip correct_answer and explanation before sending
  return battle.questions.map((q) => {
    // Create a shallow copy and delete sensitive fields to satisfy strict linting
    const safeQ = { ...q } as Partial<typeof q>;
    delete safeQ.correct_answer;
    delete safeQ.explanation;
    return safeQ;
  });
}

// ── Add questions (creator only, before battle starts) ───────────────────

export async function addQuestions(
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
  const battleId = await resolveBattleId(battleIdOrSlug);
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: { _count: { select: { questions: true } } },
  });
  if (!battle) throw createAppError('Battle not found', 404);
  if (battle.user_id !== userId)
    throw createAppError('Only the creator can add questions', 403);
  if (['IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(battle.status)) {
    throw createAppError(
      'Cannot add questions to a battle that has already started or ended',
      400
    );
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
