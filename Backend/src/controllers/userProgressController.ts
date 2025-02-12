import { Request, Response } from 'express';
import {
  getUserProgress,
  getAchievements,
  calculateExperienceLevel,
  updateUserProgress,
  updateUserPoints,
} from '../services/userService';
import { createAppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

export const getProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw createAppError('User not found', 404);

    const [progress, achievements, experienceLevel] = await Promise.all([
      getUserProgress(userId),
      getAchievements(userId),
      calculateExperienceLevel(userId),
    ]);

    res.status(200).json({
      status: 'success',
      data: { ...progress, achievements, experienceLevel },
    });
  } catch (error) {
    logger.error('Error fetching user progress:', error);
    throw createAppError('Failed to fetch user progress', 400);
  }
};

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw createAppError('User not found', 404);

    const { topicId, status, score } = req.body;

    await updateUserProgress(userId, {
      topicId,
      isCompleted: status === 'completed',
      timeSpent: 0,
    });

    if (status === 'completed') {
      await updateUserPoints(userId, score || 10);
    }

    res.status(200).json({
      status: 'success',
      message: 'Progress updated successfully',
    });
  } catch (error) {
    logger.error('Error updating user progress:', error);
    throw createAppError('Failed to update progress', 400);
  }
};
