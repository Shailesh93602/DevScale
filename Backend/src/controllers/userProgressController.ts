import { Request, Response } from 'express';
import { createAppError } from '../middlewares/errorHandler.js';
import UserProgressRepository from '../repositories/userProgressRepository.js';
import UserPointsRepository from '../repositories/userPointsRepository.js';
import { catchAsync } from '../utils/index.js';
import { sendResponse } from '../utils/apiResponse.js';
import { invalidatePattern } from '../services/memoryCache.js';

export default class UserProgressController {
  private readonly userProgressRepo: UserProgressRepository;
  private readonly userPointsRepo: UserPointsRepository;

  constructor() {
    this.userProgressRepo = new UserProgressRepository();
    this.userPointsRepo = new UserPointsRepository();
  }

  public getProgress = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw createAppError('User not found', 404);

    const [progress, achievements, experienceLevel] = await Promise.all([
      this.userProgressRepo.getUserProgress(userId),
      this.userProgressRepo.getAchievements(userId),
      this.userProgressRepo.calculateExperienceLevel(userId),
    ]);

    sendResponse(res, 'PROGRESS_FETCHED', {
      data: { ...progress, achievements, experienceLevel },
    });
  });

  public updateProgress = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw createAppError('User not found', 404);

    const { topicId, status, score } = req.body;

    await this.userProgressRepo.updateUserProgress(userId, {
      topic_id: topicId,
      is_completed: status === 'completed',
      timeSpent: 0,
    });

    if (status === 'completed') {
      await this.userPointsRepo.updateUserPoints(userId, score || 10);
    }

    invalidatePattern(`dashboard:summary:${userId}`); // Ensure dashboard shows progress
    sendResponse(res, 'PROGRESS_UPDATED');
  });
}
