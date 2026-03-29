import { Request, Response, NextFunction } from 'express';
import { createAppError } from '../utils/errorHandler.js';

/**
 * Middleware to restrict access to Pro features based on subscription tier.
 * Assumes req.user is populated (run AFTER authenticate middleware).
 */
export const requirePro = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req;

  if (!user) {
    return next(createAppError('Authentication required', 401));
  }

  const tier = user.subscription?.tier ?? 'free';
  const status = user.subscription?.status ?? 'inactive';

  if ((tier === 'pro' || tier === 'team') && (status === 'active' || status === 'trialing')) {
    return next();
  }

  return next(createAppError('Pro subscription required for this feature', 403));
};

/**
 * Middleware to restrict access to Team features.
 */
export const requireTeam = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req;

  if (!user) {
    return next(createAppError('Authentication required', 401));
  }

  const tier = user.subscription?.tier ?? 'free';
  const status = user.subscription?.status ?? 'inactive';

  if (tier === 'team' && (status === 'active' || status === 'trialing')) {
    return next();
  }

  return next(createAppError('Team subscription required for this feature', 403));
};
