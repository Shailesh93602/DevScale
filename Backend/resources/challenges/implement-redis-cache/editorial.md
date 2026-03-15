# Editorial: Implement Caching Layer with Redis

## Approach Overview

A caching layer requires careful consideration of data freshness, memory management, and concurrency. The core patterns are cache-aside (lazy loading) and write-through (eager loading).

## Key Design Decisions

### 1. Cache-Aside vs Write-Through
- **Cache-Aside**: Application checks cache first, fetches from DB on miss, stores result in cache. Simple but risks stale data.
- **Write-Through**: Every write goes to both cache and DB. Ensures consistency but adds write latency.

### 2. Eviction Strategy
LRU (Least Recently Used) is the most common. When cache is full, evict the entry that hasn't been accessed for the longest time.

### 3. Cache Stampede Prevention
When a popular key expires, many concurrent requests may all try to regenerate it simultaneously. Use a mutex/lock to ensure only one request fetches from the source.

## Implementation

### Step 1: Core Data Structure

```typescript
interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;  // Unix timestamp, null = no expiry
  lastAccessed: number;
}

class LRUCache {
  private store: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private locks: Map<string, Promise<any>>;  // For stampede prevention
}
```

### Step 2: TTL Management

```typescript
private isExpired(entry: CacheEntry<any>): boolean {
  if (entry.expiresAt === null) return false;
  return Date.now() > entry.expiresAt;
}

private evictExpired(): void {
  for (const [key, entry] of this.store) {
    if (this.isExpired(entry)) {
      this.store.delete(key);
      this.stats.evictions++;
    }
  }
}
```

### Step 3: LRU Eviction

```typescript
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
```

### Step 4: Stampede Prevention

```typescript
async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
  const cached = await this.get<T>(key);
  if (cached !== null) return cached;

  // Check if another request is already fetching this key
  if (this.locks.has(key)) {
    return this.locks.get(key) as Promise<T>;
  }

  // Acquire lock and fetch
  const fetchPromise = fetcher().then(async (value) => {
    await this.set(key, value, ttl);
    this.locks.delete(key);
    return value;
  });

  this.locks.set(key, fetchPromise);
  return fetchPromise;
}
```

## Complexity Analysis

- **GET**: O(1) average with Map
- **SET**: O(1) average, O(n) worst case when eviction needed
- **DELETE**: O(1)
- **Pattern Invalidation**: O(n) where n = total keys
- **Space**: O(maxSize)

## Common Pitfalls

1. **Not handling TTL** - Stale data served indefinitely
2. **No eviction policy** - Memory grows unbounded
3. **Cache stampede** - Multiple concurrent DB calls for the same expired key
4. **Not serializing properly** - Object references instead of deep copies
5. **Ignoring cache consistency** - Not invalidating on writes
