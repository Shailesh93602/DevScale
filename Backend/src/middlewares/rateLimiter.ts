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
    redisClient = null;
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

// Different rate limits for different routes
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
});

export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Upload limit exceeded, please try again later',
});
