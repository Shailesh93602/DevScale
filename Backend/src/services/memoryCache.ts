/**
 * Simple in-memory cache mechanism map
 * Used as a fallback when Redis is unavailable or for simple, non-distributed caching needs
 */

const cache = new Map<string, { data: unknown; expiresAt: number }>();

/**
 * Get an item from the cache
 * @param key Cache key
 * @returns The cached item, or null if not found or expired
 */
export function getCached<T>(key: string): T | null {
  const item = cache.get(key);

  if (!item) return null;

  // Check expiration
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }

  return item.data as T;
}

/**
 * Set an item in the cache
 * @param key Cache key
 * @param data Data to cache
 * @param ttlSeconds Time to live in seconds
 */
export function setCached<T>(key: string, data: T, ttlSeconds: number): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Invalidate items matching a prefix
 * @param prefix Cache key prefix to remove
 */
export function invalidatePattern(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

// Periodic cleanup runs every minute to remove expired keys
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now > item.expiresAt) {
      cache.delete(key);
    }
  }
}, 60 * 1000).unref(); // unref prevents this interval from keeping the Node process alive indefinitely
