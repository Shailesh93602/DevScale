import { Request, Response, NextFunction } from 'express';
import { createAppError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import { RBACRepository } from '../repositories/rbacRepository.js';
import prisma from '../lib/prisma.js';

const rbacRepo = new RBACRepository();

export const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createAppError('Unauthorized', 401);
      }

      const hasPermission = await rbacRepo.checkPermission(
        req.user.id,
        resource,
        action
      );

      if (!hasPermission) {
        throw createAppError('Forbidden', 403);
      }

      next();
    } catch (error) {
      logger.error('Permission check failed:', error);
      next(error);
    }
  };
};

export const requireRole = (role: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createAppError('Unauthorized', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { role: true },
      });

      const hasRole = user?.role?.name === role;

      if (!hasRole) {
        throw createAppError('Forbidden', 403);
      }

      next();
    } catch (error) {
      logger.error('Role check failed:', error);
      next(error);
    }
  };
};
