import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';

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
