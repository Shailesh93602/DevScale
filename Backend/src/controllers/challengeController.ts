import { Difficulty, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import {
  createChallenge,
  updateChallenge,
  getAllChallenges,
  submitChallenge,
  getLeaderboard,
} from '../services/challengeService';
import { createAppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';
import { getChallengeStats } from '../services/adminResourceService';

const prisma = new PrismaClient();

export const getChallenges = catchAsync(async (req: Request, res: Response) => {
  const { page = '1', limit = '10', search = '' } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);

  const skip = (pageNumber - 1) * pageSize;

  const whereCondition:
    | {
        OR: [
          {
            title: { contains: string; node: 'insensitive' };
          },
          {
            description: { contains: string; node: 'insensitive' };
          },
        ];
      }
    | object = search
    ? {
        OR: [
          { title: { contains: search as string, mode: 'insensitive' } },
          {
            description: { contains: search as string, mode: 'insensitive' },
          },
        ],
      }
    : {};

  const [challenges, totalCount] = await Promise.all([
    prisma.challenge.findMany({
      where: whereCondition,
      take: pageSize,
      skip,
      orderBy: { created_at: 'desc' },
    }),
    prisma.challenge.count({ where: whereCondition }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  res.status(200).json({
    challenges,
    currentPage: pageNumber,
    totalPages,
    totalChallenges: totalCount,
  });
});

export const getChallenge = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = '1', limit = '10', search = '' } = req.query;

  if (id) {
    const challenge = await prisma.challenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    return res.status(200).json(challenge);
  }

  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * pageSize;

  const whereCondition:
    | {
        OR: [
          {
            title: { contains: string; node: 'insensitive' };
          },
          {
            description: { contains: string; node: 'insensitive' };
          },
        ];
      }
    | object = search
    ? {
        OR: [
          { title: { contains: search as string, mode: 'insensitive' } },
          {
            description: { contains: search as string, mode: 'insensitive' },
          },
        ],
      }
    : {};

  const [challenges, totalCount] = await Promise.all([
    prisma.challenge.findMany({
      where: whereCondition,
      take: pageSize,
      skip,
      orderBy: { created_at: 'desc' },
    }),
    prisma.challenge.count({ where: whereCondition }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  res.status(200).json({
    challenges,
    currentPage: pageNumber,
    totalPages,
    totalChallenges: totalCount,
  });
});

export class ChallengeController {
  static async createChallenge(req: Request, res: Response) {
    try {
      const challenge = await createChallenge(req.body);

      res.status(201).json({
        status: 'success',
        data: { challenge },
      });
    } catch (error) {
      logger.error('Error creating challenge:', error);
      throw createAppError('Failed to create challenge', 400);
    }
  }

  static async updateChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const challenge = await updateChallenge(id, req.body);

      res.status(200).json({
        status: 'success',
        data: { challenge },
      });
    } catch (error) {
      logger.error('Error updating challenge:', error);
      throw createAppError('Failed to update challenge', 400);
    }
  }

  static async getChallenge(req: Request, res: Response) {
    try {
      const challenge = await getChallengeStats();

      res.status(200).json({
        status: 'success',
        data: { challenge },
      });
    } catch (error) {
      logger.error('Error fetching challenge:', error);
      throw createAppError('Failed to fetch challenge', 400);
    }
  }

  static async getAllChallenges(req: Request, res: Response) {
    try {
      const { difficulty, category, tags } = req.query;
      const challenges = await getAllChallenges({
        difficulty: difficulty as Difficulty,
        category: category as string,
        tags: tags ? (tags as string).split(',') : undefined,
      });

      res.status(200).json({
        status: 'success',
        data: { challenges },
      });
    } catch (error) {
      logger.error('Error fetching challenges:', error);
      throw createAppError('Failed to fetch challenges', 400);
    }
  }

  static async submitChallenge(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw createAppError('User not found', 404);

      const { challengeId } = req.params;
      const { code, language } = req.body;

      const submission = await submitChallenge({
        code,
        language,
        userId,
        challengeId,
      });

      res.status(200).json({
        status: 'success',
        data: { submission },
      });
    } catch (error) {
      logger.error('Error submitting challenge:', error);
      throw createAppError('Failed to submit challenge', 400);
    }
  }

  static async getLeaderboard(req: Request, res: Response) {
    try {
      const { challengeId } = req.query;
      const leaderboard = await getLeaderboard(challengeId as string);

      res.status(200).json({
        status: 'success',
        data: { leaderboard },
      });
    } catch (error) {
      logger.error('Error fetching leaderboard:', error);
      throw createAppError('Failed to fetch leaderboard', 400);
    }
  }
}
