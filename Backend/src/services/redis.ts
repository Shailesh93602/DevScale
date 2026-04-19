import Redis from 'ioredis';
import { REDIS_URL } from '../config';
import logger from '../utils/logger';

const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 50, 2000);
  },
});

redisConnection.on('error', (err: Error & { code?: string }) => {
  if (err.code !== 'ECONNREFUSED') {
    logger.error('Redis connection error', {
      message: err.message,
      code: err.code,
    });
  }
});

export class RedisClient {
  static async hset(
    key: string,
    field: string,
    value: string
  ): Promise<number> {
    return redisConnection.hset(key, field, value);
  }

  static async hget(key: string, field: string): Promise<string | null> {
    return redisConnection.hget(key, field);
  }

  static async zadd(
    key: string,
    score: number,
    member: string
  ): Promise<number> {
    return redisConnection.zadd(key, score, member);
  }

  static async zremrangebyscore(
    key: string,
    min: number,
    max: number
  ): Promise<number> {
    return redisConnection.zremrangebyscore(key, min, max);
  }

  static async zrangebyscore(
    key: string,
    min: number,
    max: number
  ): Promise<string[]> {
    return redisConnection.zrangebyscore(key, min, max);
  }

  static async get(key: string): Promise<string | null> {
    return redisConnection.get(key);
  }

  static async setex(
    key: string,
    seconds: number,
    value: string
  ): Promise<string> {
    return redisConnection.setex(key, seconds, value);
  }

  static async keys(pattern: string): Promise<string[]> {
    return redisConnection.keys(pattern);
  }
}

export const redisClient = new RedisClient();
