import { createRateLimiter } from './rateLimiter';

// Rate limiter for battle creation
export const battleCreationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 battles per 15 minutes
  message: 'Too many battle creation attempts. Please try again later.',
});

// Rate limiter for battle joins
export const battleJoinLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 battle joins per hour
  message: 'Too many battle join attempts. Please try again later.',
});

// Rate limiter for battle submissions
export const battleSubmissionLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 submissions per 5 minutes
  message: 'Too many submission attempts. Please try again later.',
});
