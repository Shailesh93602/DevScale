import {
  PrismaClient,
  Challenge,
  ChallengeSubmission,
  Difficulty,
  ChallengeCategory,
} from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import { executeCode } from '../utils/codeExecutor';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface ChallengeData {
  title: string;
  description: string;
  points: number;
  topic_id: string;
  difficulty: Difficulty;
  category: ChallengeCategory;
  input_format: string;
  output_format: string;
  example_input: string;
  example_output: string;
  constraints: string;
  function_signature: string;
  time_limit?: number;
  memory_limit?: number;
  tags: string[];
  test_cases: TestCase[];
  solutions?: Record<string, string>;
}

interface TestCase {
  input: string;
  output: string;
  isHidden?: boolean;
}

interface SubmissionData {
  code: string;
  language: string;
  user_id: string;
  challenge_id: string;
}

export const createChallenge = async (
  data: ChallengeData
): Promise<Challenge> => {
  const { topic_id, test_cases, ...challenge_data } = data;
  return prisma.challenge.create({
    data: {
      ...challenge_data,
      topic: { connect: { id: topic_id } },
      test_cases: { create: test_cases },
    },
  });
};

export const updateChallenge = async (
  id: string,
  data: Partial<ChallengeData>
): Promise<Challenge> => {
  return prisma.challenge.update({
    where: { id },
    data: {
      ...data,
      test_cases: data.test_cases
        ? { deleteMany: {}, create: data.test_cases }
        : undefined,
    },
  });
};

export const getChallenge = async (id: string): Promise<Challenge> => {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: { test_cases: { where: { is_hidden: false } } },
  });

  if (!challenge) throw createAppError('Challenge not found', 404);
  return challenge;
};

export const getAllChallenges = async (filters?: {
  difficulty?: Difficulty;
  category?: string;
  tags?: string[];
}) => {
  return prisma.challenge.findMany({
    where: {
      difficulty: filters?.difficulty,
      category: filters?.category as ChallengeCategory,
      tags: filters?.tags ? { hasEvery: filters.tags } : undefined,
    },
    include: {
      _count: { select: { submissions: { where: { status: 'accepted' } } } },
    },
  });
};

export const submitChallenge = async (
  data: SubmissionData
): Promise<ChallengeSubmission> => {
  const challenge = await getChallenge(data.challenge_id);
  const test_cases = await prisma.testCase.findMany({
    where: { challenge_id: data.challenge_id },
  });

  const results = await Promise.all(
    test_cases.map(async (test_case) => {
      try {
        const result = await executeCode({
          code: data.code,
          language: data.language,
          input: test_case.input,
          timeLimit: challenge.time_limit ?? 0,
          memoryLimit: challenge.memory_limit ?? 0,
        });

        return {
          passed: result.output.trim() === test_case.output.trim(),
          execution_time: result.executionTime,
          memory_used: result.memoryUsed,
        };
      } catch (error) {
        logger.error('Code execution error:', error);
        return { passed: false, error: (error as Error).message };
      }
    })
  );

  const allPassed = results.every((r) => r.passed);
  const avgExecutionTime =
    results.reduce((acc, r) => acc + (r.execution_time || 0), 0) /
    results.length;
  const maxMemoryUsed = Math.max(...results.map((r) => r.memory_used || 0));

  const submission = await prisma.challengeSubmission.create({
    data: {
      ...data,
      status: allPassed ? 'accepted' : 'wrong_answer',
      runtime_ms: avgExecutionTime,
      memory_used_kb: maxMemoryUsed,
      feedback: results.map((r) => r.error).join('\n'),
      score: allPassed ? calculatePoints(challenge.difficulty) : 0,
    },
  });

  if (allPassed) {
    await prisma.userPoints.upsert({
      where: { user_id: data.user_id },
      update: { points: { increment: calculatePoints(challenge.difficulty) } },
      create: {
        user_id: data.user_id,
        points: calculatePoints(challenge.difficulty),
      },
    });
  }

  return submission;
};

export const getLeaderboard = async (challengeId?: string) => {
  const leaderboard = await prisma.userPoints.findMany({
    orderBy: { points: 'desc' },
    take: 100,
    include: { user: { select: { username: true, avatar_url: true } } },
  });

  if (!challengeId) return leaderboard;

  const submissions = await prisma.challengeSubmission.findMany({
    where: {
      challenge_id: challengeId,
      status: 'accepted',
      user_id: { in: leaderboard.map((l) => l.user_id) },
    },
    orderBy: { runtime_ms: 'asc' },
  });

  return leaderboard.map((l) => ({
    ...l,
    bestSubmission: submissions.find((s) => s.user_id === l.user_id),
  }));
};

const calculatePoints = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case Difficulty.EASY:
      return 10;
    case Difficulty.MEDIUM:
      return 20;
    case Difficulty.HARD:
      return 30;
    default:
      return 10;
  }
};
