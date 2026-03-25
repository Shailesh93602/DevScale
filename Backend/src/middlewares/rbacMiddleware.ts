import { Request, Response, NextFunction } from 'express';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';

export const requirePermission = () =>
  // resource: string, action: string
  {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw createAppError('Unauthorized', 401);
        }

        // TODO: Implement this function
        // const hasPermission = await checkPermission(
        //   req.user.id,
        //   resource,
        //   action
        // );

        // if (!hasPermission) {
        //   throw createAppError('Forbidden', 403);
        // }

        next();
      } catch (error) {
        logger.error('Permission check failed:', error);
        next(error);
      }
    };
  };

export const requireRole = () =>
  // role: string
  {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw createAppError('Unauthorized', 401);
        }

        // TODO: Implement this function
        // const hasRole = await checkRole(req.user.id, role);

        // if (!hasRole) {
        //   throw createAppError('Forbidden', 403);
        // }

        next();
      } catch (error) {
        logger.error('Role check failed:', error);
        next(error);
      }
    };
  };
