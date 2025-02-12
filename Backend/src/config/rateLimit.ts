import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../services/redis';

// Base rate limit configuration
const baseConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    prefix: 'rate-limit:',
    // @ts-expect-error - Correct property is sendClient but types are outdated
    sendClient: redisClient,
  }),
};

// Different rate limit configurations
export const rateLimits = {
  // API endpoints rate limit
  api: rateLimit({
    ...baseConfig,
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many API requests, please try again later',
  }),

  // Authentication endpoints rate limit
  auth: rateLimit({
    ...baseConfig,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 failed login attempts per hour
    message: 'Too many login attempts, please try again later',
  }),

  // User creation rate limit
  registration: rateLimit({
    ...baseConfig,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3, // limit each IP to 3 account creations per day
    message: 'Too many accounts created, please try again later',
  }),

  // Content creation rate limit
  content: rateLimit({
    ...baseConfig,
    max: 50, // limit each IP to 50 content creations per windowMs
    message: 'Content creation limit reached, please try again later',
  }),
};
