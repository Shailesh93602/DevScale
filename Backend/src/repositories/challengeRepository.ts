import { Challenge, ChallengeSubmission } from '@prisma/client';
import { Difficulty, ChallengeCategory } from '../constants/enums';
import { createAppError } from '../utils/errorHandler.js';
import BaseRepository from './baseRepository.js';
import logger from '../utils/logger.js';
import { executeCode } from '../utils/codeExecutor';
import { wrapCode } from '../utils/codeWrapper';
import {
  ChallengeData,
  ResourceStats,
  ChallengeSubmissionData,
} from '../types/index.js';
import { invalidateCachePattern } from '../services/cacheService';

import prisma from '../lib/prisma.js';

export class ChallengeRepository extends BaseRepository<
  Challenge,
  typeof prisma.challenge
> {
  constructor() {
    super(prisma.challenge);
  }
  async createChallenge(data: ChallengeData): Promise<Challenge> {
    const { topic_id, test_cases, ...challenge_data } = data;
    return prisma.challenge.create({
      data: {
        ...challenge_data,
        topic: { connect: { id: topic_id } },
        test_cases: { create: test_cases },
      },
    });
  }

  async updateChallenge(
    id: string,
    data: Partial<ChallengeData>
  ): Promise<Challenge> {
    return prisma.challenge.update({
      where: { id },
      data: {
        ...data,
        test_cases: data.test_cases
          ? { deleteMany: {}, create: data.test_cases }
          : undefined,
      },
    });
  }

  async getChallenge(id: string): Promise<Challenge> {
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: { test_cases: { where: { is_hidden: false } } },
    });

    if (!challenge) throw createAppError('Challenge not found', 404);
    return challenge;
  }

  async getAllChallenges(filters?: {
    difficulty?: Difficulty;
    category?: string;
    tags?: string[];
  }) {
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
  }

  async submitChallenge(
    data: ChallengeSubmissionData
  ): Promise<ChallengeSubmission> {
    const challenge = await this.getChallenge(data.challenge_id);
    if (challenge.status !== 'ACTIVE') {
      throw createAppError('This challenge is not accepting submissions', 400);
    }
    const test_cases = await prisma.testCase.findMany({
      where: { challenge_id: data.challenge_id },
    });
    // `[].every()` is true: with no test cases any code would be "accepted".
    if (test_cases.length === 0) {
      throw createAppError('This challenge has no test cases to grade', 400);
    }
    // The same program "Run" executes (codeController.runCode wraps it too).
    const program = wrapCode(data.code, data.language, challenge);

    const results = await Promise.all(
      test_cases.map(async (test_case) => {
        try {
          const result = await executeCode({
            code: program,
            language: data.language,
            input: test_case.input,
            // Stored in ms; Judge0's cpu_time_limit is seconds.
            timeLimit: challenge.time_limit ? challenge.time_limit / 1000 : 0,
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

    const points = this.calculatePoints(challenge.difficulty);
    return prisma.$transaction(async (tx) => {
      // Serialises submissions per (user, challenge) so only the first
      // accepted one can pay; re-submitting solved code pays nothing.
      const lockKey = `challenge-solve:${data.user_id}:${data.challenge_id}`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
      const solvedBefore =
        allPassed &&
        (await tx.challengeSubmission.findFirst({
          where: {
            user_id: data.user_id,
            challenge_id: data.challenge_id,
            status: 'accepted',
          },
          select: { id: true },
        }));

      const submission = await tx.challengeSubmission.create({
        data: {
          ...data,
          status: allPassed ? 'accepted' : 'wrong_answer',
          runtime_ms: avgExecutionTime,
          memory_used_kb: maxMemoryUsed,
          feedback: results.map((r) => r.error).join('\n'),
          score: allPassed ? points : 0,
        },
      });

      if (allPassed && !solvedBefore) {
        await tx.userPoints.upsert({
          where: { user_id: data.user_id },
          update: { points: { increment: points } },
          create: { user_id: data.user_id, points },
        });
      }
      return submission;
    });
  }

  async getLeaderboard(challengeId?: string) {
    const leaderboard = await prisma.userPoints.findMany({
      orderBy: { points: 'desc' },
      take: 100,
      include: { user: { select: { username: true, avatar_url: true } } },
    });

    if (!challengeId) return leaderboard;

    // Selected, not the whole row: `code` is another user's accepted solution.
    const submissions = await prisma.challengeSubmission.findMany({
      where: {
        challenge_id: challengeId,
        status: 'accepted',
        user_id: { in: leaderboard.map((l) => l.user_id) },
      },
      select: {
        id: true,
        user_id: true,
        language: true,
        runtime_ms: true,
        memory_used_kb: true,
        score: true,
        created_at: true,
      },
      orderBy: { runtime_ms: 'asc' },
    });

    return leaderboard.map((l) => ({
      ...l,
      bestSubmission: submissions.find((s) => s.user_id === l.user_id),
    }));
  }

  async getChallengeStats(): Promise<ResourceStats> {
    const [total, active, pending, reported] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'ACTIVE' } }),
      this.count({ where: { status: 'PENDING' } }),
      this.prismaClient.contentReport.count({
        where: { content_type: 'CHALLENGE' },
      }),
    ]);

    return { total, active, pending, reported };
  }

  async manageChallenge(challenge_id: string, action: string) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challenge_id },
    });
    if (!challenge) throw createAppError('Challenge not found', 404);

    switch (action) {
      case 'activate':
        await prisma.challenge.update({
          where: { id: challenge_id },
          data: { status: 'ACTIVE' },
        });
        break;
      case 'deactivate':
        await prisma.challenge.update({
          where: { id: challenge_id },
          data: { status: 'ARCHIVED' },
        });
        break;
      case 'delete':
        await prisma.challenge.delete({ where: { id: challenge_id } });
        break;
      default:
        throw createAppError('Invalid action', 400);
    }

    await invalidateCachePattern(`challenge:${challenge_id}:*`);
  }

  private calculatePoints(difficulty: string) {
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
  }
}
