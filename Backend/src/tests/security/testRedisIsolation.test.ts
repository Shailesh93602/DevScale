/**
 * eduscale-backend#26-03 — the test run connected to production Redis.
 *
 * jest-setup.ts imports the real cacheService and rateLimiter (for teardown),
 * both of which build an ioredis client at import time from REDIS_URL, which
 * dotenv loads from Backend/.env — the production Upstash instance. Asserts
 * on the clients those modules actually built, not on the variable.
 */
import { describe, it, expect } from '@jest/globals';
import { redis } from '../../services/cacheService';
import { redisClient } from '../../middlewares/rateLimiter';

const LOOPBACK = ['127.0.0.1', 'localhost', '::1'];

describe('Redis clients built under Jest', () => {
  it('cacheService points at loopback', () => {
    expect(LOOPBACK).toContain(redis.options.host);
  });

  it('rateLimiter points at loopback', () => {
    expect(LOOPBACK).toContain(redisClient?.options.host);
  });
});
