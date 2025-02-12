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
  topicId: string;
  difficulty: Difficulty;
  category: ChallengeCategory;
  inputFormat: string;
  outputFormat: string;
  exampleInput: string;
  exampleOutput: string;
  constraints: string;
  functionSignature: string;
  timeLimit?: number;
  memoryLimit?: number;
  tags: string[];
  testCases: TestCase[];
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
  userId: string;
  challengeId: string;
}

export const createChallenge = async (
  data: ChallengeData
): Promise<Challenge> => {
  const { topicId, testCases, ...challengeData } = data;
  return prisma.challenge.create({
    data: {
      ...challengeData,
      topic: { connect: { id: topicId } },
      testCases: { create: testCases },
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
      testCases: data.testCases
        ? { deleteMany: {}, create: data.testCases }
        : undefined,
    },
  });
};

export const getChallenge = async (id: string): Promise<Challenge> => {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: { testCases: { where: { isHidden: false } } },
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
  const challenge = await getChallenge(data.challengeId);
  const testCases = await prisma.testCase.findMany({
    where: { challengeId: data.challengeId },
  });

  const results = await Promise.all(
    testCases.map(async (testCase) => {
      try {
        const result = await executeCode({
          code: data.code,
          language: data.language,
          input: testCase.input,
          timeLimit: challenge.timeLimit ?? 0,
          memoryLimit: challenge.memoryLimit ?? 0,
        });

        return {
          passed: result.output.trim() === testCase.output.trim(),
          executionTime: result.executionTime,
          memoryUsed: result.memoryUsed,
        };
      } catch (error) {
        logger.error('Code execution error:', error);
        return { passed: false, error: (error as Error).message };
      }
    })
  );

  const allPassed = results.every((r) => r.passed);
  const avgExecutionTime =
    results.reduce((acc, r) => acc + (r.executionTime || 0), 0) /
    results.length;
  const maxMemoryUsed = Math.max(...results.map((r) => r.memoryUsed || 0));

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
      where: { userId: data.userId },
      update: { points: { increment: calculatePoints(challenge.difficulty) } },
      create: {
        userId: data.userId,
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
      challengeId,
      status: 'accepted',
      userId: { in: leaderboard.map((l) => l.userId) },
    },
    orderBy: { runtime_ms: 'asc' },
  });

  return leaderboard.map((l) => ({
    ...l,
    bestSubmission: submissions.find((s) => s.userId === l.userId),
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
