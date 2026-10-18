// Design a Rate Limiter - Reference Solution

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  algorithm: 'token_bucket' | 'fixed_window' | 'sliding_window';
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

interface RateLimitRule {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
}

// Token Bucket implementation
class TokenBucket {
  private buckets: Map<string, { tokens: number; lastRefill: number }> = new Map();

  isAllowed(clientId: string, maxTokens: number, refillRatePerMs: number): RateLimitResult {
    const now = Date.now();
    let bucket = this.buckets.get(clientId);

    if (!bucket) {
      bucket = { tokens: maxTokens, lastRefill: now };
      this.buckets.set(clientId, bucket);
    }

    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefill;
    bucket.tokens = Math.min(maxTokens, bucket.tokens + elapsed * refillRatePerMs);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetAt: now + Math.ceil((maxTokens - bucket.tokens) / refillRatePerMs),
      };
    }

    const retryAfterMs = Math.ceil((1 - bucket.tokens) / refillRatePerMs);
    return {
      allowed: false,
      remaining: 0,
      resetAt: now + Math.ceil(maxTokens / refillRatePerMs),
      retryAfter: Math.ceil(retryAfterMs / 1000),
    };
  }
}

// Fixed Window implementation
class FixedWindow {
  private windows: Map<string, number> = new Map();

  isAllowed(clientId: string, maxRequests: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const windowId = Math.floor(now / windowMs);
    const key = `${clientId}:${windowId}`;

    const count = (this.windows.get(key) || 0) + 1;
    this.windows.set(key, count);

    // Clean old windows
    const prevKey = `${clientId}:${windowId - 2}`;
    this.windows.delete(prevKey);

    const resetAt = (windowId + 1) * windowMs;

    if (count <= maxRequests) {
      return {
        allowed: true,
        remaining: maxRequests - count,
        resetAt,
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter: Math.ceil((resetAt - now) / 1000),
    };
  }
}

// Sliding Window Counter implementation
class SlidingWindowCounter {
  private windows: Map<string, number> = new Map();

  isAllowed(clientId: string, maxRequests: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const currentWindow = Math.floor(now / windowMs);
    const previousWindow = currentWindow - 1;
    const elapsedFraction = (now % windowMs) / windowMs;

    const currentKey = `${clientId}:${currentWindow}`;
    const previousKey = `${clientId}:${previousWindow}`;

    const currentCount = this.windows.get(currentKey) || 0;
    const previousCount = this.windows.get(previousKey) || 0;

    // Weighted estimate of requests in the sliding window
    const estimatedCount = previousCount * (1 - elapsedFraction) + currentCount;

    const resetAt = (currentWindow + 1) * windowMs;

    if (estimatedCount < maxRequests) {
      this.windows.set(currentKey, currentCount + 1);

      // Clean old windows
      const oldKey = `${clientId}:${currentWindow - 2}`;
      this.windows.delete(oldKey);

      return {
        allowed: true,
        remaining: Math.floor(maxRequests - estimatedCount - 1),
        resetAt,
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter: Math.ceil((resetAt - now) / 1000),
    };
  }
}

// Main Rate Limiter (facade)
class RateLimiter {
  private tokenBucket = new TokenBucket();
  private fixedWindow = new FixedWindow();
  private slidingWindow = new SlidingWindowCounter();
  private rules: RateLimitRule[] = [];
  private defaultConfig: RateLimitConfig;

  constructor(defaultConfig?: Partial<RateLimitConfig>) {
    this.defaultConfig = {
      maxRequests: 100,
      windowMs: 60000,
      algorithm: 'sliding_window',
      ...defaultConfig,
    };
  }

  // Check if a request is allowed
  isAllowed(clientId: string, config?: Partial<RateLimitConfig>): RateLimitResult {
    const finalConfig = { ...this.defaultConfig, ...config };

    switch (finalConfig.algorithm) {
      case 'token_bucket': {
        const refillRate = finalConfig.maxRequests / finalConfig.windowMs;
        return this.tokenBucket.isAllowed(clientId, finalConfig.maxRequests, refillRate);
      }
      case 'fixed_window':
        return this.fixedWindow.isAllowed(clientId, finalConfig.maxRequests, finalConfig.windowMs);
      case 'sliding_window':
        return this.slidingWindow.isAllowed(clientId, finalConfig.maxRequests, finalConfig.windowMs);
      default:
        throw new Error(`Unknown algorithm: ${finalConfig.algorithm}`);
    }
  }

  // Check with endpoint-specific rules
  isAllowedForEndpoint(clientId: string, endpoint: string): RateLimitResult {
    const rule = this.rules.find(r => r.endpoint === endpoint)
      || this.rules.find(r => r.endpoint === '*');

    if (rule) {
      return this.isAllowed(`${clientId}:${endpoint}`, {
        maxRequests: rule.maxRequests,
        windowMs: rule.windowMs,
      });
    }

    return this.isAllowed(clientId);
  }

  // Configure rules
  configure(rules: RateLimitRule[]): void {
    this.rules = rules;
  }

  // Express middleware
  middleware(config?: Partial<RateLimitConfig>) {
    return (req: any, res: any, next: any) => {
      const clientId = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const result = this.isAllowed(clientId, config);

      res.set('X-RateLimit-Limit', String(this.defaultConfig.maxRequests));
      res.set('X-RateLimit-Remaining', String(result.remaining));
      res.set('X-RateLimit-Reset', String(result.resetAt));

      if (!result.allowed) {
        res.set('Retry-After', String(result.retryAfter));
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: result.retryAfter,
        });
      }

      next();
    };
  }
}

export { RateLimiter, TokenBucket, FixedWindow, SlidingWindowCounter, RateLimitResult };
