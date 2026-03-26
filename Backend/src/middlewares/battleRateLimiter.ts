import { createRateLimiter } from './rateLimiter';

// Rate limiter for battle creation — separate key so it isn't polluted by other API calls
export const battleCreationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // relaxed in dev/test
  message: 'Too many battle creation attempts. Please try again later.',
  keyPrefix: 'rate-limit-battle-create',
});

// Rate limiter for battle joins
export const battleJoinLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // relaxed in dev/test
  message: 'Too many battle join attempts. Please try again later.',
  keyPrefix: 'rate-limit-battle-join',
});

// Rate limiter for battle submissions
export const battleSubmissionLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === 'production' ? 20 : 200, // relaxed in dev/test
  message: 'Too many submission attempts. Please try again later.',
  keyPrefix: 'rate-limit-battle-submit',
});
