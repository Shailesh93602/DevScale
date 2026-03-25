import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { DashboardRepository } from '../repositories/dashboardRepository';
import { createAppError } from '../utils/createAppError';
import { sendResponse } from '@/utils/apiResponse';

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

      const progress = await this.dashboardRepo.getLearningProgress(userId);
      return sendResponse(res, 'LEARNING_PROGRESS_FETCHED', {
        data: progress,
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
}
