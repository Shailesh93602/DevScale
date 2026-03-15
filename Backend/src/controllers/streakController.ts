import { Request, Response } from 'express';

import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/apiResponse';
import { createAppError } from '../utils/errorHandler';
import StreakRepository from '../repositories/streakRepository';

export class StreakController {
  private readonly streakRepo: StreakRepository;

  constructor() {
    this.streakRepo = new StreakRepository();
  }

  public updateStreak = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw createAppError('User not authenticated', 401);
    }

    const { activityType, minutesSpent, timezone } = req.body;
    const updatedStreak = await this.streakRepo.updateStreak(userId, {
      activityType,
      minutesSpent,
      timezone,
    });

    sendResponse(res, 'STREAK_UPDATED', { data: updatedStreak });
  });

  public getStreakStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw createAppError('User not authenticated', 401);
    }

    const timezone = (req.query.timezone as string) || 'UTC';
    const streakStats = await this.streakRepo.getUserStreak(userId);

    if (!streakStats) {
      return sendResponse(res, 'STREAK_STATS_FETCHED', {
        data: {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          streakStartDate: null,
          dailyActivities: [],
          timezone,
        },
      });
    }

    sendResponse(res, 'STREAK_STATS_FETCHED', { data: streakStats });
  });

  public getWeeklyActivity = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw createAppError('User not authenticated', 401);
    }

    const weeklyActivity = await this.streakRepo.getWeeklyActivity(userId);

    sendResponse(res, 'WEEKLY_ACTIVITY_FETCHED', { data: weeklyActivity });
  });
}
