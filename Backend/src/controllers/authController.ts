import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../config';
import { redis } from '../services/cacheService';
import { clearAuthCache } from '../middlewares/authMiddleware';
import { recordAuthFailure, clearAuthFailures } from '../middlewares/accountLockout';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const TOKEN_BLOCKLIST_PREFIX = 'eduscale:auth:blocklist:';
const REFRESH_COOKIE = 'sb-refresh-token';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

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

    logger.info('auth:logout', { userId: req.user?.id, ip: req.ip, ua: req.headers['user-agent'] });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/refresh
 * Issues a fresh Supabase access token using the refresh token stored in
 * an httpOnly cookie.  Rotates the refresh token cookie on every call so
 * stolen cookies expire after a single use.
 *
 * Cookie set: sb-refresh-token (httpOnly, Secure in prod, SameSite=Strict, 7d)
 * Response body: { access_token, expires_in }
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refresh = req.cookies?.[REFRESH_COOKIE];
    if (!refresh) return next(createAppError('No refresh token cookie', 401));

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refresh });

    if (error || !data.session) {
      // Clear the stale cookie so the client doesn't loop
      res.clearCookie(REFRESH_COOKIE);
      await recordAuthFailure(req);
      logger.warn('Refresh token invalid or expired', { error: error?.message });
      return next(createAppError('Refresh token invalid or expired — please log in again', 401));
    }

    const { access_token, refresh_token: newRefresh, expires_in } = data.session;

    // Successful refresh — reset failure counter
    await clearAuthFailures(req);

    // Rotate: replace old cookie with new refresh token
    res.cookie(REFRESH_COOKIE, newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: '/api/v1/auth',
    });

    logger.info('Token refreshed', { userId: data.user?.id });
    res.json({ success: true, access_token, expires_in });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/set-refresh-cookie
 * Called immediately after Supabase login on the frontend.  Receives the
 * Supabase refresh token in the request body and stores it in an httpOnly
 * cookie so the browser JS can never access it directly.
 *
 * The frontend should call this once after `supabase.auth.signInWithPassword`
 * succeeds, then discard the refresh token from JS memory.
 */
export const setRefreshCookie = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refresh_token } = req.body as { refresh_token?: string };
    if (!refresh_token || typeof refresh_token !== 'string') {
      return next(createAppError('refresh_token is required', 400));
    }

    res.cookie(REFRESH_COOKIE, refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: '/api/v1/auth',
    });

    res.json({ success: true });
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

