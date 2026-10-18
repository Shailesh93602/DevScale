// Implement Caching Layer with Redis - Reference Solution

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
  lastAccessed: number;
  size: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

class CacheService {
  private store: Map<string, CacheEntry<any>> = new Map();
  private locks: Map<string, Promise<any>> = new Map();
  private maxSize: number;
  private defaultTTL: number;
  private stats = { hits: 0, misses: 0, evictions: 0 };

  constructor(maxSize: number = 10000, defaultTTLSeconds: number = 300) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  // GET - retrieve a value from cache
  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.store.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update last accessed for LRU
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    // Return deep copy to prevent reference mutation
    return JSON.parse(JSON.stringify(entry.value)) as T;
  }

  // SET - store a value in cache with optional TTL
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    // Validate key
    if (!key || key.length > 256) {
      throw new Error('Key must be 1-256 characters');
    }

    // Validate value size
    const serialized = JSON.stringify(value);
    if (serialized.length > 1048576) { // 1MB
      throw new Error('Value exceeds maximum size of 1MB');
    }

    // Evict if at capacity
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      this.evictExpired();
      if (this.store.size >= this.maxSize) {
        this.evictLRU();
      }
    }

    const ttlMs = ttlSeconds !== undefined ? ttlSeconds * 1000 : this.defaultTTL;
    const now = Date.now();

    this.store.set(key, {
      value: JSON.parse(serialized), // Deep copy
      expiresAt: ttlMs > 0 ? now + ttlMs : null,
      lastAccessed: now,
      size: serialized.length,
    });
  }

  // DELETE - remove a key from cache
  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  // GET OR SET - cache-aside pattern with stampede prevention
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Check if another request is already fetching this key (stampede prevention)
    if (this.locks.has(key)) {
      return this.locks.get(key) as Promise<T>;
    }

    // Fetch from source
    const fetchPromise = (async () => {
      try {
        const value = await fetcher();
        await this.set(key, value, ttlSeconds);
        return value;
      } finally {
        this.locks.delete(key);
      }
    })();

    this.locks.set(key, fetchPromise);
    return fetchPromise;
  }

  // MGET - retrieve multiple keys at once
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => this.get<T>(key)));
  }

  // MSET - set multiple key-value pairs at once
  async mset(entries: { key: string; value: any; ttl?: number }[]): Promise<void> {
    await Promise.all(entries.map(entry => this.set(entry.key, entry.value, entry.ttl)));
  }

  // INVALIDATE PATTERN - delete all keys matching a glob pattern
  async invalidatePattern(pattern: string): Promise<number> {
    const regex = this.globToRegex(pattern);
    let count = 0;

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }

    return count;
  }

  // GET STATS - return cache statistics
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      size: this.store.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  // Check if an entry is expired
  private isExpired(entry: CacheEntry<any>): boolean {
    if (entry.expiresAt === null) return false;
    return Date.now() > entry.expiresAt;
  }

  // Evict all expired entries
  private evictExpired(): void {
    for (const [key, entry] of this.store) {
      if (this.isExpired(entry)) {
        this.store.delete(key);
        this.stats.evictions++;
      }
    }
  }

  // Evict the least recently used entry
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.store) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  // Convert glob pattern to regex (supports * and ?)
  private globToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`);
  }
}

// Express middleware for HTTP response caching
function cacheMiddleware(cache: CacheService, ttlSeconds: number = 60) {
  return async (req: any, res: any, next: any) => {
    if (req.method !== 'GET') return next();

    const cacheKey = `http:${req.originalUrl}`;
    const cached = await cache.get<{ status: number; body: any }>(cacheKey);

    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.status(cached.status).json(cached.body);
    }

    // Intercept response to cache it
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, { status: res.statusCode, body }, ttlSeconds);
      }
      res.set('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

export { CacheService, CacheStats, cacheMiddleware };
