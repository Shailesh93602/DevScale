import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(createAppError('Authorization token required', 401));
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return next(createAppError('Invalid authentication token', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication failed', error);
    next(createAppError('Authentication failed', 401));
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createAppError('Unauthorized', 401));
    }

    const userRole = req.user.user_metadata?.role || 'user';
    if (!allowedRoles.includes(userRole)) {
      return next(createAppError('Insufficient permissions', 403));
    }

    next();
  };
};
