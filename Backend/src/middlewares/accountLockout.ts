/**
 * Account lockout middleware
 *
 * Tracks failed authentication events keyed by IP address.
 * After MAX_FAILURES within the window, the IP is locked for LOCK_DURATION_SECS.
 * On any successful auth (req.user populated), the failure counter is cleared.
 *
 * Applied to: POST /api/v1/auth/refresh  (brute-force refresh token attacks)
 * Auth middleware already fails-open on Redis downtime — this follows the same
 * pattern: skip lockout enforcement if Redis is unreachable.
 */
import { Request, Response, NextFunction } from 'express';
import { redis } from '../services/cacheService';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';

const MAX_FAILURES = 10;
const WINDOW_SECS = 15 * 60;       // 15-minute sliding window for counting failures
const LOCK_DURATION_SECS = 30 * 60; // 30-minute lockout
const FAILURE_PREFIX = 'eduscale:lockout:failures:';
const LOCK_PREFIX    = 'eduscale:lockout:locked:';

const ipKey = (req: Request) => req.ip || 'unknown';

export const checkAccountLockout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = LOCK_PREFIX + ipKey(req);
    const locked = await redis.exists(key);
    if (locked) {
      const ttl = await redis.ttl(key);
      logger.warn('Locked IP attempted request', { ip: ipKey(req), ttlRemaining: ttl });
      next(createAppError(
        `Too many failed attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`,
        429,
      ));
      return;
    }
    next();
  } catch {
    // fail open — don't block legitimate users if Redis is down
    next();
  }
};

export const recordAuthFailure = async (req: Request): Promise<void> => {
  try {
    const failKey = FAILURE_PREFIX + ipKey(req);
    const lockKey = LOCK_PREFIX    + ipKey(req);

    const failures = await redis.incr(failKey);
    // Reset expiry on every increment so the window stays sliding
    await redis.expire(failKey, WINDOW_SECS);

    if (failures >= MAX_FAILURES) {
      await redis.setex(lockKey, LOCK_DURATION_SECS, '1');
      await redis.del(failKey); // reset counter once lock is set
      logger.warn('IP locked after repeated auth failures', { ip: ipKey(req), failures });
    }
  } catch {
    // non-fatal
  }
};

export const clearAuthFailures = async (req: Request): Promise<void> => {
  try {
    await redis.del(FAILURE_PREFIX + ipKey(req));
  } catch {
    // non-fatal
  }
};
