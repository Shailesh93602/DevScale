import prisma from '../lib/prisma';
import { getCache, setCache } from './cacheService';

export type QuestionSourceType =
  | 'topic'
  | 'subject'
  | 'main_concept'
  | 'roadmap'
  | 'dsa';

export interface PoolQuestion {
  source_quiz_question_id: string | null;
  source_challenge_id: string | null;
  question: string;
  options: string[]; // exactly 4 items
  correct_answer: number; // index 0-3
  explanation: string | null;
  points: number;
  time_limit: number;
}

export interface QuestionPoolOptions {
  type: QuestionSourceType;
  id: string;
  difficulty?: string;
  categories?: string[];
  count?: number;
  exclude_question_ids?: string[]; // anti-repeat: source_quiz_question_id values to skip
}

export interface QuestionPoolResult {
  questions: PoolQuestion[];
  total_available: number;
}

/** Shuffle an array in place using Fisher-Yates */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Convert a QuizQuestion (with QuizOption[]) into a PoolQuestion.
 * Returns null if the question has fewer than 2 options or no correct answer.
 */
function convertQuizQuestion(
  q: {
    id: string;
    question: string;
    options: { answer_text: string; is_correct: boolean }[];
  },
  defaultPoints: number,
  defaultTimeLimit: number
): PoolQuestion | null {
  if (!q.options || q.options.length < 2) return null;

  // Pad to exactly 4 options, or trim if more
  const opts = q.options.slice(0, 4);
  while (opts.length < 4) {
    opts.push({ answer_text: 'N/A', is_correct: false });
  }

  const correctIndex = opts.findIndex((o) => o.is_correct);
  if (correctIndex === -1) return null;

  return {
    source_quiz_question_id: q.id,
    source_challenge_id: null,
    question: q.question,
    options: opts.map((o) => o.answer_text),
    correct_answer: correctIndex,
    explanation: null,
    points: defaultPoints,
    time_limit: defaultTimeLimit,
  };
}

/**
 * Fetch recently used quiz question IDs for the given source (last 30 days),
 * so we can avoid repeating them.
 */
async function getRecentlyUsedIds(
  sourceType: QuestionSourceType,
  sourceId: string
): Promise<string[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const rows = await prisma.battleQuestion.findMany({
    where: {
      source_quiz_question_id: { not: null },
      battle: {
        question_source_type: sourceType,
        question_source_id: sourceId,
        created_at: { gte: thirtyDaysAgo },
      },
    },
    select: { source_quiz_question_id: true },
  });

  return rows.map((r) => r.source_quiz_question_id as string);
}

/**
 * Fetch all QuizQuestions for a set of quiz IDs, with their QuizOptions.
 */
async function fetchQuestionsForQuizIds(
  quizIds: string[]
): Promise<PoolQuestion[]> {
  if (quizIds.length === 0) return [];

  const quizQuestions = await prisma.quizQuestion.findMany({
    where: { quiz_id: { in: quizIds } },
    include: {
      options: { orderBy: { id: 'asc' } },
    },
  });

  const results: PoolQuestion[] = [];
  for (const q of quizQuestions) {
    const converted = convertQuizQuestion(q, 100, 30);
    if (converted) results.push(converted);
  }
  return results;
}

// ─── Source resolvers ───────────────────────────────────────────────────────

async function poolForTopic(topicId: string): Promise<PoolQuestion[]> {
  const quizzes = await prisma.quiz.findMany({
    where: { topic_id: topicId },
    select: { id: true },
  });
  return fetchQuestionsForQuizIds(quizzes.map((q) => q.id));
}

async function poolForSubject(subjectId: string): Promise<PoolQuestion[]> {
  // Quizzes directly on the subject
  const directQuizzes = await prisma.quiz.findMany({
    where: { subject_id: subjectId },
    select: { id: true },
  });

  // Quizzes on topics that belong to this subject
  const topicLinks = await prisma.subjectTopic.findMany({
    where: { subject_id: subjectId },
    select: { topic_id: true },
  });
  const topicIds = topicLinks.map((t) => t.topic_id);

  const topicQuizzes = await prisma.quiz.findMany({
    where: { topic_id: { in: topicIds } },
    select: { id: true },
  });

  const allIds = [
    ...new Set([...directQuizzes, ...topicQuizzes].map((q) => q.id)),
  ];
  return fetchQuestionsForQuizIds(allIds);
}

async function poolForMainConcept(
  mainConceptId: string
): Promise<PoolQuestion[]> {
  // Quizzes directly on the main concept
  const directQuizzes = await prisma.quiz.findMany({
    where: { main_concept_id: mainConceptId },
    select: { id: true },
  });

  // Walk: mainConcept → subjects → topics
  const subjectLinks = await prisma.mainConceptSubject.findMany({
    where: { main_concept_id: mainConceptId },
    select: { subject_id: true },
  });
  const subjectIds = subjectLinks.map((s) => s.subject_id);

  const subjectQuizzes = await prisma.quiz.findMany({
    where: { subject_id: { in: subjectIds } },
    select: { id: true },
  });

  const topicLinks = await prisma.subjectTopic.findMany({
    where: { subject_id: { in: subjectIds } },
    select: { topic_id: true },
  });
  const topicIds = topicLinks.map((t) => t.topic_id);

  const topicQuizzes = await prisma.quiz.findMany({
    where: { topic_id: { in: topicIds } },
    select: { id: true },
  });

  const allIds = [
    ...new Set(
      [...directQuizzes, ...subjectQuizzes, ...topicQuizzes].map((q) => q.id)
    ),
  ];
  return fetchQuestionsForQuizIds(allIds);
}

async function poolForRoadmap(roadmapId: string): Promise<PoolQuestion[]> {
  // Round 1 (parallel): main concept IDs + direct roadmap→topic links
  const [mcLinks, roadmapTopicLinks] = await Promise.all([
    prisma.roadmapMainConcept.findMany({
      where: { roadmap_id: roadmapId },
      select: { main_concept_id: true },
    }),
    prisma.roadmapTopic.findMany({
      where: { roadmap_id: roadmapId },
      select: { topic_id: true },
    }),
  ]);
  const mcIds = mcLinks.map((m) => m.main_concept_id);
  const directTopicIds = roadmapTopicLinks.map((t) => t.topic_id);

  // Round 2 (parallel): mc-level quizzes + subject links (both depend on mcIds)
  const [mcQuizzes, subjectLinks] = await Promise.all([
    prisma.quiz.findMany({
      where: { main_concept_id: { in: mcIds } },
      select: { id: true },
    }),
    prisma.mainConceptSubject.findMany({
      where: { main_concept_id: { in: mcIds } },
      select: { subject_id: true },
    }),
  ]);
  const subjectIds = subjectLinks.map((s) => s.subject_id);

  // Round 3 (parallel): subject-level quizzes + topic links (both depend on subjectIds)
  const [subjectQuizzes, topicLinks] = await Promise.all([
    prisma.quiz.findMany({
      where: { subject_id: { in: subjectIds } },
      select: { id: true },
    }),
    prisma.subjectTopic.findMany({
      where: { subject_id: { in: subjectIds } },
      select: { topic_id: true },
    }),
  ]);
  const allTopicIds = [
    ...new Set([...topicLinks.map((t) => t.topic_id), ...directTopicIds]),
  ];

  // Round 4: topic-level quizzes
  const topicQuizzes = await prisma.quiz.findMany({
    where: { topic_id: { in: allTopicIds } },
    select: { id: true },
  });

  const allIds = [
    ...new Set(
      [...mcQuizzes, ...subjectQuizzes, ...topicQuizzes].map((q) => q.id)
    ),
  ];
  return fetchQuestionsForQuizIds(allIds);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get a randomised pool of questions for battle creation.
 *
 * @param opts.count      How many questions to return (default 10, max 50)
 * @param opts.exclude_question_ids  source_quiz_question_id values to skip (anti-repeat)
 */
export async function getQuestionPool(
  opts: QuestionPoolOptions
): Promise<QuestionPoolResult> {
  const count = Math.min(opts.count ?? 10, 50);
  const cacheKey = `qpool:${opts.type}:${opts.id}:${opts.difficulty ?? 'any'}`;

  // Try cache (preview only — anti-repeat exclusions are not cached)
  let allQuestions = await getCache<PoolQuestion[]>(cacheKey);

  if (!allQuestions) {
    switch (opts.type) {
      case 'topic':
        allQuestions = await poolForTopic(opts.id);
        break;
      case 'subject':
        allQuestions = await poolForSubject(opts.id);
        break;
      case 'main_concept':
        allQuestions = await poolForMainConcept(opts.id);
        break;
      case 'roadmap':
        allQuestions = await poolForRoadmap(opts.id);
        break;
      case 'dsa':
        // DSA challenges — Phase 2. Return empty for now.
        allQuestions = [];
        break;
      default:
        allQuestions = [];
    }

    await setCache(cacheKey, allQuestions, { ttl: 300 });
  }

  const total_available = allQuestions.length;

  // Apply anti-repeat exclusion
  const excludeSet = new Set(opts.exclude_question_ids ?? []);
  let filtered = allQuestions.filter(
    (q) =>
      !q.source_quiz_question_id || !excludeSet.has(q.source_quiz_question_id)
  );

  // If exclusion leaves too few, fall back to full pool
  if (filtered.length < count) {
    filtered = allQuestions;
  }

  shuffle(filtered);
  const questions = filtered.slice(0, count);

  return { questions, total_available };
}

/**
 * Get recently used question IDs for anti-repeat logic, given source type + id.
 * Call this before getQuestionPool to populate exclude_question_ids.
 */
export async function getAntiRepeatExclusions(
  sourceType: QuestionSourceType,
  sourceId: string
): Promise<string[]> {
  return getRecentlyUsedIds(sourceType, sourceId);
}
