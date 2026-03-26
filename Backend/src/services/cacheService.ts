import Redis from 'ioredis';
import logger from '../utils/logger';
import { REDIS_URL } from '../config';

type CacheOptions = {
  ttl?: number;
  prefix?: string;
};

export const redis = new Redis(REDIS_URL);

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  try {
    const { ttl = 3600, prefix = '' } = options;
    const fullKey = prefix ? `${prefix}:${key}` : key;
    const serializedValue = JSON.stringify(value);

    if (ttl > 0) {
      await redis.setex(fullKey, ttl, serializedValue);
    } else {
      await redis.set(fullKey, serializedValue);
    }
  } catch (error) {
    logger.error('Cache set error:', error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.error('Cache pattern invalidation error:', error);
  }
}

export async function getOrSetCache<T>(
  key: string,
  callback: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached) return cached;

  const fresh = await callback();
  await setCache(key, fresh, options);
  return fresh;
}

export async function getWithLock<T>(
  key: string,
  callback: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const lockKey = `lock:${key}`;
  const lockTtl = 5; // 5 seconds lock timeout

  try {
    const cached = await getCache<T>(key);
    if (cached) return cached;

    const acquired = await redis.set(lockKey, '1', 'EX', lockTtl, 'NX');

    if (!acquired) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return getWithLock(key, callback, options);
    }

    const fresh = await callback();
    await setCache(key, fresh, options);
    return fresh;
  } finally {
    await redis.del(lockKey);
  }
}
