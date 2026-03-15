import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import { ChallengeStatus } from '@prisma/client';
import UserRepository from '../repositories/userRepository';
import UserProgressRepository from '../repositories/userProgressRepository';
import ResourceRepository from '../repositories/resourceRepository';
import { ChallengeRepository } from '../repositories/challengeRepository';
import { createAppError } from '../utils/errorHandler';

import prisma from '../lib/prisma';
export default class AnalyticsController {
  private readonly defaultStartDate: Date;
  private readonly userRepo: UserRepository;
  private readonly userProgressRepo: UserProgressRepository;
  private readonly resourceRepo: ResourceRepository;
  private readonly challengeRepo: ChallengeRepository;

  constructor() {
    this.defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    this.userRepo = new UserRepository();
    this.userProgressRepo = new UserProgressRepository();
    this.resourceRepo = new ResourceRepository();

    this.challengeRepo = new ChallengeRepository();
  }

  public getUserAnalytics = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const analytics = await this.userProgressRepo.getUserAnalytics(userId);
    sendResponse(res, 'USER_ANALYTICS_FETCHED', { data: analytics });
  });

  public getCurrentUserAnalytics = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user?.id;

      if (!userId) {
        throw createAppError('User not found', 404);
      }
      const analytics = await this.userProgressRepo.getUserAnalytics(userId);
      sendResponse(res, 'USER_ANALYTICS_FETCHED', { data: analytics });
    }
  );

  public getPlatformAnalytics = catchAsync(
    async (req: Request, res: Response) => {
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : this.defaultStartDate;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date();

      const [
        userGrowth,
        contentEngagement,
        challengeCompletion,
        resourceUsage,
      ] = await Promise.all([
        this.userRepo.groupBy({
          by: ['created_at'],
          where: {
            created_at: {
              gte: startDate,
              lte: endDate,
            },
          },
          _count: true,
          orderBy: {
            created_at: 'asc',
          },
        }),
        this.resourceRepo.groupBy({
          by: ['type'],
          where: {
            created_at: {
              gte: startDate,
              lte: endDate,
            },
          },
          _count: true,
          _avg: {
            rating: true,
          },
          orderBy: {
            type: 'asc',
          },
        }),
        this.challengeRepo.groupBy({
          by: ['status'],
          where: {
            created_at: {
              gte: startDate,
              lte: endDate,
            },
          },
          _count: true,
          orderBy: {
            status: 'asc',
          },
        }),
        this.resourceRepo.groupBy({
          by: ['type'],
          where: {
            created_at: {
              gte: startDate,
              lte: endDate,
            },
          },
          _count: true,
          orderBy: {
            type: 'asc',
          },
        }),
      ]);

      sendResponse(res, 'PLATFORM_ANALYTICS_FETCHED', {
        data: {
          userGrowth,
          contentEngagement,
          challengeCompletion,
          resourceUsage,
        },
      });
    }
  );

  public generateReport = catchAsync(async (req: Request, res: Response) => {
    const { reportType } = req.params;
    const filters = {
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : this.defaultStartDate,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date(),
      userId: req.query.userId as string,
      type: req.query.type as string,
      status: (req.query.status as string)?.toUpperCase() as ChallengeStatus,
    };

    let reportData;

    switch (reportType) {
      case 'user_activity':
        reportData = await prisma.userActivityLog.findMany({
          where: {
            timestamp: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
            user_id: filters.userId,
          },
          include: {
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        });
        break;

      case 'resource_usage':
        reportData = await this.resourceRepo.findMany({
          where: {
            created_at: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
            type: filters.type,
            user_id: filters.userId,
          },
          include: {
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        });
        break;

      case 'challenge_submissions':
        reportData = await this.challengeRepo.findMany({
          where: {
            created_at: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
            status: filters.status,
          },
        });
        break;

      default:
        throw createAppError('Invalid report type', 400);
    }
    sendResponse(res, 'REPORT_GENERATED', { data: reportData });
  });
}
