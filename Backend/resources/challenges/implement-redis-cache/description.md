# Implement Caching Layer with Redis

## Problem Description

Implement a caching layer service that sits between your API and database, using Redis-like semantics. The cache should support TTL-based expiration, multiple caching strategies (cache-aside, write-through), and handle common cache problems like stampede and invalidation.

## Requirements

### Functional Requirements
1. **Basic Operations**: GET, SET, DELETE with optional TTL
2. **Cache-Aside Pattern**: Automatically fetch from source on cache miss
3. **Write-Through**: Option to update cache on writes
4. **Bulk Operations**: Multi-get and multi-set support
5. **Cache Invalidation**: Pattern-based key invalidation
6. **Statistics**: Track hit rate, miss rate, and eviction count

### Cache Operations

```typescript
interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds?: number): Promise<T>;
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  mset(entries: { key: string; value: any; ttl?: number }[]): Promise<void>;
  invalidatePattern(pattern: string): Promise<number>;
  getStats(): CacheStats;
}
```

## Examples

### Example 1: Cache-Aside Pattern
```typescript
// First call - cache MISS, fetches from database
const user = await cache.getOrSet('user:123', async () => {
  return await db.users.findById(123);
}, 300);
// Returns: { data: {...}, source: 'database' }

// Second call - cache HIT
const user2 = await cache.getOrSet('user:123', fetchFn, 300);
// Returns: { data: {...}, source: 'cache' }
```

### Example 2: TTL Expiration
```typescript
await cache.set('session:abc', { userId: 1 }, 60);
// After 60 seconds...
const session = await cache.get('session:abc');
// Returns: null (expired)
```

### Example 3: Pattern Invalidation
```typescript
await cache.set('user:1:profile', {...});
await cache.set('user:1:posts', [...]);
await cache.set('user:2:profile', {...});

const count = await cache.invalidatePattern('user:1:*');
// Returns: 2 (deleted user:1:profile and user:1:posts)
```

## Constraints

- Maximum cache size: 10,000 entries (LRU eviction when full)
- Default TTL: 300 seconds (5 minutes)
- Key length: max 256 characters
- Value size: max 1MB when serialized
- Must handle concurrent access safely
- Cache operations should complete in under 5ms
- Must prevent cache stampede for concurrent identical misses
