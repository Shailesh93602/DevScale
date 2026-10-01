// Global Jest setup/teardown file
// This file runs after each test file

import { redis } from '../services/cacheService';
import { redisClient } from '../middlewares/rateLimiter';
import prisma from '../lib/prisma';

afterAll(async () => {
  // Give Jest a moment to settle pending microtasks
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Disconnect Redis clients cleanly
  try {
    if (redisClient) {
      redisClient.disconnect();
    }
  } catch {
    // Ignore teardown disconnect errors
  }

  try {
    redis.disconnect();
  } catch {
    // Ignore teardown disconnect errors
  }

  // Close Prisma connection
  try {
    await prisma.$disconnect();
  } catch {
    // Ignore teardown disconnect errors
  }
});
