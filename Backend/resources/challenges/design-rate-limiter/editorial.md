# Editorial: Design a Rate Limiter

## High-Level Design

```
Request -> Rate Limiter Middleware -> [Check Redis] -> Allow/Deny -> API Handler
```

## Algorithms Comparison

| Algorithm | Pros | Cons | Memory |
|-----------|------|------|--------|
| Token Bucket | Allows bursts, smooth | Complex state | O(1) per client |
| Fixed Window | Simple, low memory | Burst at boundary | O(1) per client |
| Sliding Window Log | Most accurate | High memory | O(N) per client |
| Sliding Window Counter | Good accuracy, low memory | Approximation | O(1) per client |

## Implementation

### Token Bucket Algorithm

```typescript
class TokenBucket {
  tokens: number;
  lastRefill: number;
  maxTokens: number;
  refillRate: number; // tokens per ms

  consume(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}
```

### Fixed Window Algorithm

```typescript
class FixedWindow {
  isAllowed(clientId: string, max: number, windowMs: number): boolean {
    const windowKey = Math.floor(Date.now() / windowMs);
    const key = `${clientId}:${windowKey}`;
    const count = this.increment(key);
    return count <= max;
  }
}
```

### Sliding Window Counter (Recommended)

```typescript
class SlidingWindowCounter {
  isAllowed(clientId: string, max: number, windowMs: number): boolean {
    const now = Date.now();
    const currentWindow = Math.floor(now / windowMs);
    const previousWindow = currentWindow - 1;
    const elapsed = (now % windowMs) / windowMs;

    const currentCount = this.getCount(clientId, currentWindow);
    const previousCount = this.getCount(clientId, previousWindow);

    // Weighted combination
    const estimatedCount = previousCount * (1 - elapsed) + currentCount;
    return estimatedCount < max;
  }
}
```

## Data Model

```
Redis keys:
  ratelimit:{clientId}:{windowId} -> count (INTEGER)
  ratelimit:{clientId}:tokens -> { tokens: number, lastRefill: number }
```

## Scalability Discussion

1. **Distributed counting**: Use Redis INCR (atomic) for shared state
2. **Local + global**: Local counters synced periodically to Redis for lower latency
3. **Sharding**: Shard by client ID hash
4. **Race conditions**: Use Redis Lua scripts for atomic check-and-increment
5. **Graceful degradation**: If Redis is down, use local rate limiting as fallback

## Complexity Analysis

- **Token Bucket**: O(1) time, O(1) space per client
- **Fixed Window**: O(1) time, O(1) space per client per window
- **Sliding Window Counter**: O(1) time, O(2) space per client (current + previous window)
- **Sliding Window Log**: O(N) time for cleanup, O(N) space per client
