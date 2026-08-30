import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Redis } from 'ioredis';
import { REDIS_URL } from '../config/index.js';
import logger from '../utils/logger.js';

let redisClient: Redis | null = null;
try {
  redisClient = new Redis(REDIS_URL || 'redis://localhost:6379', {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
  });

  redisClient.on('error', (err: Error & { code?: string }) => {
    if (err.code !== 'ECONNREFUSED') {
      logger.error('Redis connection error:', err);
    }
    // Deliberately NOT `redisClient = null`. ioredis reconnects on its own, but
    // nulling the handle was permanent for the life of the process: one
    // transient error silently disabled every rate limiter and the account
    // lockout — with no log line saying so — until a redeploy. Keeping the
    // client lets limiting resume the moment Redis is back.
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
  });
} catch (err) {
  logger.error('Failed to initialize Redis:', err);
}

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  keyPrefix?: string;
}

export const createRateLimiter = (
  options: RateLimitOptions = {}
): RequestHandler => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // 100 requests per window
    message = 'Too many requests, please try again later',
    keyPrefix = 'rate-limit',
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!redisClient) {
      // Fail OPEN on purpose: a limiter outage must not take the API down.
      // But it is logged, because "rate limiting is silently off" is a state
      // nobody should have to discover from an incident.
      logger.warn(
        `Rate limiter bypassed (no Redis client): ${keyPrefix} ${req.method} ${req.path}`
      );
      next();
      return;
    }

    const key = `${keyPrefix}:${req.ip}`;
    const windowInSeconds = Math.floor(windowMs / 1000);

    redisClient
      .multi()
      .incr(key)
      .expire(key, windowInSeconds)
      .exec()
      .then((result: [Error | null, unknown][] | null) => {
        if (!result?.[0]) {
          next();
          return;
        }

        const [incrResult, expireResult] = result;
        const [incrErr, requestCount] = incrResult;
        const [expireErr] = expireResult;

        if (incrErr || expireErr) {
          logger.error('Redis operation error:', { incrErr, expireErr });
          next();
          return;
        }

        const count = typeof requestCount === 'number' ? requestCount : 1;

        res.setHeader('X-RateLimit-Limit', max.toString());
        res.setHeader(
          'X-RateLimit-Remaining',
          Math.max(0, max - count).toString()
        );

        if (count > max) {
          res.status(429).json({
            status: 429,
            message,
          });
          return;
        }

        next();
      })
      .catch((err: unknown) => {
        logger.error('Rate limiting error:', err);
        next();
      });
  };
};

// Different rate limits for different routes.
//
// Every limiter MUST pass its own keyPrefix. Left on the default they all share
// one Redis counter (`rate-limit:<ip>`), so unrelated traffic spends each
// other's budget AND each call rewrites the TTL with its own window — an api
// call would reset the 15-minute auth window to 60 seconds, defeating the
// login throttle entirely.
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
  keyPrefix: 'rate-limit-auth',
});

export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  keyPrefix: 'rate-limit-api',
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Upload limit exceeded, please try again later',
  keyPrefix: 'rate-limit-upload',
});
