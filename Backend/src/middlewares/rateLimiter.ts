import rateLimit from 'express-rate-limit';
import RedisStore, { RedisReply } from 'rate-limit-redis';
import Redis, { Command } from 'ioredis';
import { REDIS_URL } from '../config';

const redis = new Redis(REDIS_URL);

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Max requests per window
  message?: string; // Error message
}

export const createRateLimiter = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // 100 requests per window
    message = 'Too many requests, please try again later',
  } = options;

  return rateLimit({
    store: new RedisStore({
      sendCommand: (command: string, ...args: string[]): Promise<RedisReply> =>
        redis.sendCommand(new Command(command, args)) as Promise<RedisReply>,
      prefix: 'rate-limit:',
    }),
    windowMs,
    max,
    message: {
      status: 429,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
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
