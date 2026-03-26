import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import prisma from '@/lib/prisma';
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(createAppError('Authorization token required', 401));
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Invalid authentication attempt', { error });
      return next(createAppError('Invalid authentication token', 401));
    }

    const userData = await prisma?.user.findUnique({
      where: { supabase_id: user.id },
    });

    if (!userData) {
      return next(createAppError('User not found', 401));
    }

    req.user = userData;
    next();
  } catch (error) {
    logger.error('Authentication failed', { error });
    next(createAppError('Authentication failed', 401));
  }
};

type UserRole = 'admin' | 'moderator' | 'user';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createAppError('Unauthorized', 401));
    }

    const userRole = req.user?.role;

    if (!userRole) {
      return next(createAppError('User role not found', 401));
    }

    if (!allowedRoles.includes(userRole)) {
      logger.warn('Insufficient permissions', {
        userId: req.user.id,
        requiredRoles: allowedRoles,
        userRole,
      });
      return next(createAppError('Insufficient permissions', 403));
    }

    next();
  };
};
