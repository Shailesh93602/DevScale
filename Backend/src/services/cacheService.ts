import { Redis } from 'ioredis';
import Redlock from 'redlock';
import logger from '../utils/logger.js';
import { REDIS_URL } from '../config/index.js';
import { REDIS_COMMAND_TIMEOUT_MS } from '../utils/deadlines.js';

type RedlockClient =
  ConstructorParameters<typeof Redlock>[0] extends Iterable<infer T>
    ? T
    : never;

type CacheOptions = {
  ttl?: number;
  prefix?: string;
};

export const redis = new Redis(REDIS_URL, {
  // Required for Redlock. NOT for Bull — Bull builds its own connections from
  // REDIS_URL (`new Queue(name, REDIS_URL)`) and never uses this client, which
  // is why the command timeout below is safe to set here.
  maxRetriesPerRequest: null,
  // 🔴 Without this, a Redis that is SLOW but connected produces awaits that
  // never settle — `maxRetriesPerRequest: null` means "retry forever", so there
  // is no rejection to catch. That silently disables every fail-open handler
  // built on top of this client: `getCache`'s catch, `getAuthCache`'s catch,
  // `isTokenBlocklisted`'s catch, and the rate limiter's "swallow any
  // RedisStore throw" wrapper in main.ts. All four are written for a
  // *rejection*, and a hang is not one — so requests stall in the rate-limit
  // middleware before reaching any route.
  //
  // Safe for the two long-lived exceptions because neither uses this client:
  // Socket.io's pub/sub connections are constructed separately in socket.ts
  // (their `subscribe` blocks by design), and Bull's are constructed by Bull.
  commandTimeout: REDIS_COMMAND_TIMEOUT_MS,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 50, 2000);
  },
});

export const redlock = new Redlock([redis as unknown as RedlockClient], {
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
});

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

/**
 * The subset of the Redis client `getWithLock` needs. Injectable so the
 * concurrency behaviour can be unit-tested against a fake, the same way
 * `matchmakingService` takes its Redis and Redlock — the module-level client
 * connects at import time and cannot be swapped once loaded.
 */
export interface LockClient {
  set(
    key: string,
    value: string,
    ex: 'EX',
    ttl: number,
    nx: 'NX'
  ): Promise<string | null>;
  del(key: string): Promise<number>;
}

export async function getWithLock<T>(
  key: string,
  callback: () => Promise<T>,
  options: CacheOptions = {},
  client: LockClient = redis as unknown as LockClient,
  read: <V>(k: string) => Promise<V | null> = getCache
): Promise<T> {
  const lockKey = `lock:${key}`;
  const lockTtl = 5; // 5 seconds lock timeout

  // 🔴 Tracked so the `finally` only deletes a lock THIS call actually took.
  //
  // The `finally` used to run `redis.del(lockKey)` unconditionally, including
  // on the path where `set … NX` returned null — i.e. where some other caller
  // held the lock. That caller's lock was then deleted by a process that never
  // owned it, so the "only one regeneration at a time" guarantee did not hold
  // under exactly the contention it exists for: every waiter that woke up,
  // recursed and returned also wiped the winner's lock on its way out.
  let acquiredHere = false;

  try {
    const cached = await read<T>(key);
    if (cached) return cached;

    const acquired = await client.set(lockKey, '1', 'EX', lockTtl, 'NX');

    if (!acquired) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return getWithLock(key, callback, options, client, read);
    }
    acquiredHere = true;

    const fresh = await callback();
    await setCache(key, fresh, options);
    return fresh;
  } finally {
    if (acquiredHere) {
      await client.del(lockKey);
    }
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
      // `.catch()` with NO argument does not swallow anything — it returns a
      // promise that rejects identically, so a throw from `redis.set` or
      // `redis.del` here (both outside the inner try) became an
      // unhandledRejection, which `main.ts` turns into `process.exit(1)`.
      // A background cache refresh must never be able to kill the process.
    })().catch((error: unknown) => {
      logger.error('SWR background revalidation failed:', error);
    });

    return stale;
  }

  // No data at all — block and fetch fresh
  const fresh = await callback();
  await setCache(key, fresh, { ttl });
  await setCache(staleKey, fresh, { ttl: staleTtl });
  return fresh;
}
