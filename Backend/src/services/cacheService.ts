import { Redis } from 'ioredis';
import Redlock from 'redlock';
import logger from '../utils/logger.js';
import { REDIS_URL } from '../config/index.js';

type RedlockClient = ConstructorParameters<typeof Redlock>[0] extends Iterable<infer T>
  ? T
  : never;

type CacheOptions = {
  ttl?: number;
  prefix?: string;
};

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // Required for Redlock and Bull
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 50, 2000);
  },
});

export const redlock = new Redlock(
  [redis as unknown as RedlockClient],
  {
    // The expected clock drift; for more check http://redis.io/topics/distlock
    driftFactor: 0.01, // time in ms

    // The max number of times Redlock will attempt to lock a resource
    // before erroring.
    retryCount: 10,

    // the time in ms between attempts
    retryDelay: 200, // time in ms

    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.rahuljaitly.com/blog/distributed-locking-using-redis
    retryJitter: 200, // time in ms

    // The minimum remaining time on a lock before an extension is attempted
    automaticExtensionThreshold: 500, // time in ms
  }
);

redlock.on('clientError', (error: Error) => {
  // Ignore 'resource_locked' errors as they are part of the normal flow
  if (error.name !== 'ResourceLockedError') {
    logger.error('Redlock Error:', error);
  }
});

redis.on('error', (err: unknown) => {
  const error = err as { code?: string };
  if (error.code !== 'ECONNREFUSED') {
    logger.error('Redis Cache Error:', err);
  }
});

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
  } catch (error: unknown) {
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

/**
 * Stale-while-revalidate (SWR) Pattern
 * 1. If fresh data exists in cache (within TTL), return it.
 * 2. If stale data exists (after TTL but before grace period), return it immediately
 *    and trigger an asynchronous revalidation in the background.
 * 3. If no data exists, wait for a fresh fetch and cache it.
 */
export async function getWithSWR<T>(
  key: string,
  callback: () => Promise<T>,
  options: CacheOptions & { staleTtl?: number } = {}
): Promise<T> {
  const { ttl = 60, staleTtl = 3600 } = options;
  const staleKey = `stale:${key}`;
  
  // Try to find fresh data
  const cached = await getCache<T>(key);
  if (cached) return cached;

  // Try to find stale data (grace period up to staleTtl)
  const stale = await getCache<T>(staleKey);
  if (stale) {
    // Return stale data immediately and revalidate in background
    // Use a lock to prevent multiple simultaneous background revalidations
    (async () => {
      const lockKey = `revalidate:lock:${key}`;
      const acquired = await redis.set(lockKey, '1', 'EX', 30, 'NX');
      if (acquired) {
        try {
          const fresh = await callback();
          await setCache(key, fresh, { ttl });
          await setCache(staleKey, fresh, { ttl: staleTtl });
        } catch (error) {
          logger.error('SWR Background Revalidation Error:', error);
        } finally {
          await redis.del(lockKey);
        }
      }
    })().catch(); // Don't await background revalidation

    return stale;
  }

  // No data at all — block and fetch fresh
  const fresh = await callback();
  await setCache(key, fresh, { ttl });
  await setCache(staleKey, fresh, { ttl: staleTtl });
  return fresh;
}
