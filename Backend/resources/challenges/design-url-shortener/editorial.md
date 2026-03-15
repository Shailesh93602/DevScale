# Editorial: Design a URL Shortener

## High-Level Design

```
Client -> Load Balancer -> API Servers -> Cache (Redis) -> Database
                                            |
                                      Analytics Queue -> Analytics DB
```

## Component Deep-Dive

### 1. Short Code Generation

**Approach A: Base62 Encoding of Auto-Increment ID**
- Use a database auto-increment counter
- Encode the counter value in Base62 (a-z, A-Z, 0-9)
- Pros: Guaranteed unique, predictable length
- Cons: Sequential (predictable), single point of failure

**Approach B: Random Generation with Collision Check**
- Generate random 6-character Base62 string
- Check database for collision
- Pros: Non-sequential, distributed-friendly
- Cons: Collision risk increases with scale

**Approach C: MD5/SHA256 Hash + Truncation**
- Hash the URL, take first 6 characters (Base62-encoded)
- Pros: Deterministic (same URL = same code)
- Cons: Higher collision risk

**Recommended**: Use Counter-based (Approach A) with a distributed counter service or pre-allocated ranges.

### 2. Database Design

```sql
CREATE TABLE urls (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  short_code VARCHAR(8) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  custom_alias BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NULL,
  click_count BIGINT DEFAULT 0
);

CREATE INDEX idx_short_code ON urls(short_code);
```

### 3. Caching Strategy

- Use Redis with LRU eviction
- Cache frequently accessed URLs (80/20 rule)
- Cache capacity: ~20% of total URLs
- TTL on cache entries: 24 hours (refresh on access)

```typescript
async resolve(shortCode: string): Promise<string> {
  // Check cache first
  const cached = await redis.get(`url:${shortCode}`);
  if (cached) return cached;

  // Cache miss - check database
  const record = await db.urls.findByShortCode(shortCode);
  if (!record) throw new NotFoundError();

  // Populate cache
  await redis.setex(`url:${shortCode}`, 86400, record.originalUrl);
  return record.originalUrl;
}
```

### 4. Analytics

- Use async event processing (message queue)
- On each redirect, publish a click event
- Analytics worker processes events and updates counters
- Prevents analytics from slowing down redirects

## Implementation

```typescript
class URLShortener {
  private counter: number = 0;
  private BASE62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  encodeBase62(num: number): string {
    let result = '';
    while (num > 0) {
      result = this.BASE62[num % 62] + result;
      num = Math.floor(num / 62);
    }
    return result.padStart(6, 'a');
  }
}
```

## Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | BIGINT | Auto-increment primary key |
| short_code | VARCHAR(8) | Unique short code |
| original_url | TEXT | Original long URL |
| expires_at | TIMESTAMP | Optional expiration |
| click_count | BIGINT | Total clicks |
| created_at | TIMESTAMP | Creation time |

## Scalability Discussion

1. **Database Sharding**: Shard by short_code hash for write distribution
2. **Read Replicas**: Use read replicas for high read throughput
3. **CDN**: Cache popular redirects at the edge
4. **Rate Limiting**: Prevent abuse of the shorten endpoint
5. **Cleanup Job**: Periodic deletion of expired URLs
