# Design a Rate Limiter

## Problem Description

Design and implement a rate limiting system that controls the rate of API requests from clients. The system should support multiple rate limiting algorithms, per-client and per-endpoint configuration, and work correctly in a distributed multi-server environment.

## Requirements

### Functional Requirements
1. **Rate Limit Check**: Determine if a request should be allowed or denied
2. **Multiple Algorithms**: Support token bucket, fixed window, and sliding window
3. **Configurable Rules**: Per-client and per-endpoint rate limit rules
4. **Response Headers**: Return remaining quota and retry-after time
5. **Usage Statistics**: Track and report usage per client

### Non-Functional Requirements
- Decision latency < 1ms
- Support 100K+ decisions per second
- Work across multiple server instances
- No single point of failure
- Accurate counting (minimal over-counting)

### API Design

```typescript
interface RateLimitConfig {
  maxRequests: number;     // Maximum requests allowed
  windowMs: number;        // Time window in milliseconds
  algorithm: 'token_bucket' | 'fixed_window' | 'sliding_window';
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;       // Requests remaining in current window
  resetAt: number;         // Timestamp when quota resets
  retryAfter?: number;     // Seconds until next allowed request
}
```

## Examples

### Example 1: Token Bucket
```typescript
const limiter = new RateLimiter({ algorithm: 'token_bucket', maxRequests: 10, windowMs: 1000 });

limiter.isAllowed('client-1'); // { allowed: true, remaining: 9 }
// ... 9 more requests ...
limiter.isAllowed('client-1'); // { allowed: false, remaining: 0, retryAfter: 0.1 }
```

### Example 2: Sliding Window
```typescript
const limiter = new RateLimiter({ algorithm: 'sliding_window', maxRequests: 100, windowMs: 60000 });

// 50 requests in the first 30 seconds
// 60 requests in the next 30 seconds
// At the boundary, sliding window correctly counts overlapping requests
```

### Example 3: Per-Endpoint Rules
```typescript
limiter.configure([
  { endpoint: '/api/search', maxRequests: 30, windowMs: 60000 },
  { endpoint: '/api/upload', maxRequests: 5, windowMs: 60000 },
  { endpoint: '*', maxRequests: 100, windowMs: 60000 },
]);
```

## Constraints

- Must not lose counts during server restarts (use external store)
- Must handle clock skew in distributed environments
- Must support at least 10,000 distinct clients
- Fixed window can have burst at window boundaries
- Sliding window provides smoother rate limiting but uses more memory
- Token bucket allows short bursts up to bucket capacity
