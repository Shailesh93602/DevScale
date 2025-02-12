import { Request, Response, NextFunction } from 'express';
import { trackUserActivity } from '../services/analyticsService';
import logger from '../utils/logger';

export const trackActivity = (activity: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (userId) {
        await trackUserActivity(userId, activity, {
          path: req.path,
          method: req.method,
          timestamp: new Date(),
        });
      }
      next();
    } catch (error) {
      logger.error('Error tracking activity:', error);
      next();
    }
  };
};
