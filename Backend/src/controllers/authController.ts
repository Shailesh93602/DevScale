import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { redis } from '../services/cacheService';
import { clearAuthCache } from '../middlewares/authMiddleware';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';

const TOKEN_BLOCKLIST_PREFIX = 'eduscale:auth:blocklist:';

const tokenBloclistKey = (token: string) =>
  TOKEN_BLOCKLIST_PREFIX + crypto.createHash('sha256').update(token).digest('hex');

/**
 * POST /api/v1/auth/logout
 * Adds the caller's JWT to the Redis blocklist so it cannot be reused
 * for its remaining lifetime, and purges the auth cache entry.
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next(createAppError('No token provided', 400));

    // Decode (without verify) to get the expiry — we only need the TTL
    const decoded = jwt.decode(token) as { exp?: number } | null;
    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded?.exp ? decoded.exp - now : 60 * 60; // default 1h if no exp

    if (ttl > 0) {
      await redis.setex(tokenBloclistKey(token), ttl, '1');
    }

    // Also clear the per-token auth cache so the next request hits the DB
    await clearAuthCache(token);

    logger.info('User logged out, token blocklisted', { userId: req.user?.id });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/refresh-cache
 * Clears the auth cache for the current token, forcing a fresh DB lookup
 * on the next request. Useful after profile changes.
 */
export const refreshCache = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) await clearAuthCache(token);
    res.json({ success: true, message: 'Auth cache cleared' });
  } catch (err) {
    next(err);
  }
};

