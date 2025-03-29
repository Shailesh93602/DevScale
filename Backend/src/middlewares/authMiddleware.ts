import { Request, Response, NextFunction } from 'express';
import { createClient, User } from '@supabase/supabase-js';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

interface AuthenticatedRequest extends Request {
  user: User;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
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

    console.log('🚀 ----------------🚀');
    console.log('🚀 ~ user:', user);
    console.log('🚀 ----------------🚀');

    console.log('🚀 ------------------🚀');
    console.log('🚀 ~ await:', error);
    console.log('🚀 ------------------🚀');

    if (error || !user) {
      logger.warn('Invalid authentication attempt', { error });
      return next(createAppError('Invalid authentication token', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication failed', { error });
    next(createAppError('Authentication failed', 401));
  }
};

type UserRole = 'admin' | 'moderator' | 'user';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createAppError('Unauthorized', 401));
    }

    const userRole = (req.user.user_metadata?.role as UserRole) || 'user';

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
