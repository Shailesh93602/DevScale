import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { DashboardRepository } from '../repositories/dashboardRepository';
import { createAppError } from '../utils/createAppError';
import { sendResponse } from '../utils/apiResponse';

export class DashboardController {
  private readonly dashboardRepo: DashboardRepository;

  constructor() {
    this.dashboardRepo = new DashboardRepository();
  }

  public getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw createAppError('User not authenticated', 401);
    }

    const stats = await this.dashboardRepo.getDashboardStats(userId);
    return sendResponse(res, 'DASHBOARD_STATS_FETCHED', { data: stats });
  });

  public getRecentActivities = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        throw createAppError('User not authenticated', 401);
      }

      const activities = await this.dashboardRepo.getRecentActivities(userId);
      return sendResponse(res, 'RECENT_ACTIVITIES_FETCHED', {
        data: activities,
      });
    }
  );

  public getLearningProgress = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        throw createAppError('User not authenticated', 401);
      }

      const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const progress = await this.dashboardRepo.getLearningProgress(userId, page, limit);
      return sendResponse(res, 'LEARNING_PROGRESS_FETCHED', {
        data: progress.items,
        meta: { total: progress.total, page: progress.page, limit: progress.limit, totalPages: progress.totalPages },
      });
    }
  );

  public getAchievements = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw createAppError('User not authenticated', 401);
    }

    const achievements = await this.dashboardRepo.getAchievements(userId);
    return sendResponse(res, 'ACHIEVEMENTS_FETCHED', {
      data: achievements,
    });
  });

  public getDashboardSummary = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw createAppError('User not authenticated', 401);
    }

    const summary = await this.dashboardRepo.getDashboardSummary(userId);

    // ETag: hash of userId + a stable time bucket so cache busts every 5 min
    const timeBucket = Math.floor(Date.now() / (5 * 60 * 1000));
    const etag = `"${userId.slice(0, 8)}-${timeBucket}"`;

    // Return 304 Not Modified if client already has fresh data
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }

    // private: user-specific, max-age=300 (5 min), stale-while-revalidate=60
    res.setHeader('Cache-Control', 'private, max-age=300, stale-while-revalidate=60');
    res.setHeader('ETag', etag);

    return sendResponse(res, 'DASHBOARD_SUMMARY_FETCHED', { data: summary });
  });
}
