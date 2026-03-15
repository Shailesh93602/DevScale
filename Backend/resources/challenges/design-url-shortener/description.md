# Design a URL Shortener

## Problem Description

Design and implement a URL shortening service similar to bit.ly or TinyURL. The system should generate short, unique aliases for long URLs, resolve short URLs back to originals, handle high read traffic with caching, and provide click analytics.

## Requirements

### Functional Requirements
1. **Shorten URL**: Given a long URL, generate a unique short URL
2. **Redirect**: Given a short URL, redirect to the original long URL
3. **Custom Aliases**: Allow users to specify custom short codes
4. **Expiration**: Support optional TTL on shortened URLs
5. **Analytics**: Track click count, referrers, geolocation

### Non-Functional Requirements
- Handle 100M total URLs in the database
- Support 10K URL redirections per second (read-heavy)
- Short URLs should be 6-8 characters long
- System should be highly available (99.9% uptime)
- Redirect latency < 100ms

### Scale Estimates
- Write: ~100 URL shortenings per second
- Read: ~10,000 URL redirections per second (100:1 read/write ratio)
- Storage: 100M URLs * 500 bytes = ~50GB
- Cache: Top 20% of URLs handle 80% of traffic

### API Design

```
POST /api/shorten
  Body: { url: string, customAlias?: string, expiresAt?: string }
  Response: { shortUrl: string, shortCode: string, createdAt: string }

GET /:shortCode
  Response: 301 Redirect to original URL

GET /api/analytics/:shortCode
  Response: { totalClicks: number, clicksByDay: [...], topReferrers: [...] }
```

## Examples

### Example 1: Shorten a URL
```
POST /api/shorten
{ "url": "https://example.com/very/long/article/about/system-design" }

Response (201):
{
  "shortUrl": "https://short.ly/a1B2c3",
  "shortCode": "a1B2c3",
  "originalUrl": "https://example.com/very/long/article/about/system-design",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### Example 2: Custom Alias
```
POST /api/shorten
{ "url": "https://example.com/promo", "customAlias": "sale2024" }

Response (201):
{ "shortUrl": "https://short.ly/sale2024", "shortCode": "sale2024" }
```

### Example 3: Redirect
```
GET /a1B2c3
Response: 301 Redirect -> https://example.com/very/long/article/about/system-design
```

## Constraints

- Short codes: 6-8 alphanumeric characters (a-z, A-Z, 0-9)
- 62^6 = ~56 billion possible codes (sufficient for 100M URLs)
- Original URLs must be valid HTTP/HTTPS URLs
- Custom aliases: 4-20 alphanumeric characters, must be unique
- URL expiration: minimum 1 hour, maximum 10 years
