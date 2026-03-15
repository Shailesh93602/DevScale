// Design a URL Shortener - Reference Solution

import * as crypto from 'crypto';

interface URLRecord {
  id: number;
  shortCode: string;
  originalUrl: string;
  customAlias: boolean;
  createdAt: string;
  expiresAt: string | null;
  clickCount: number;
}

interface ClickEvent {
  shortCode: string;
  timestamp: string;
  referrer: string | null;
  userAgent: string | null;
  ip: string | null;
}

interface Analytics {
  totalClicks: number;
  clicksByDay: { date: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}

interface ShortenResult {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string | null;
}

class URLShortener {
  private urlStore: Map<string, URLRecord> = new Map(); // shortCode -> record
  private urlIndex: Map<string, string> = new Map();     // originalUrl -> shortCode
  private cache: Map<string, { url: string; expiresAt: number }> = new Map();
  private clickEvents: ClickEvent[] = [];
  private counter: number = 100000; // Start from 100000 for 6-char codes
  private baseUrl: string;

  private static readonly BASE62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  private static readonly CACHE_TTL = 86400000; // 24 hours in ms
  private static readonly MAX_CACHE_SIZE = 100000;

  constructor(baseUrl: string = 'https://short.ly') {
    this.baseUrl = baseUrl;
  }

  // Shorten a URL
  async shorten(
    url: string,
    options?: { customAlias?: string; expiresAt?: string }
  ): Promise<ShortenResult> {
    // Validate URL
    if (!this.isValidUrl(url)) {
      throw new Error('Invalid URL format');
    }

    let shortCode: string;

    if (options?.customAlias) {
      // Custom alias
      shortCode = options.customAlias;
      if (!this.isValidAlias(shortCode)) {
        throw new Error('Custom alias must be 4-20 alphanumeric characters');
      }
      if (this.urlStore.has(shortCode)) {
        throw new Error('Custom alias already taken');
      }
    } else {
      // Check if URL already shortened
      const existing = this.urlIndex.get(url);
      if (existing && this.urlStore.has(existing)) {
        const record = this.urlStore.get(existing)!;
        return {
          shortUrl: `${this.baseUrl}/${record.shortCode}`,
          shortCode: record.shortCode,
          originalUrl: record.originalUrl,
          createdAt: record.createdAt,
          expiresAt: record.expiresAt,
        };
      }

      // Generate short code using counter + Base62
      shortCode = this.generateShortCode();
    }

    const now = new Date().toISOString();
    const record: URLRecord = {
      id: this.counter,
      shortCode,
      originalUrl: url,
      customAlias: !!options?.customAlias,
      createdAt: now,
      expiresAt: options?.expiresAt || null,
      clickCount: 0,
    };

    this.urlStore.set(shortCode, record);
    this.urlIndex.set(url, shortCode);

    // Pre-populate cache
    this.cacheSet(shortCode, url);

    return {
      shortUrl: `${this.baseUrl}/${shortCode}`,
      shortCode,
      originalUrl: url,
      createdAt: now,
      expiresAt: record.expiresAt,
    };
  }

  // Resolve a short code to original URL
  async resolve(shortCode: string): Promise<string> {
    // Check cache first
    const cached = this.cacheGet(shortCode);
    if (cached) {
      this.recordClick(shortCode);
      return cached;
    }

    // Cache miss - check store
    const record = this.urlStore.get(shortCode);
    if (!record) {
      throw new Error('Short URL not found');
    }

    // Check expiration
    if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
      this.urlStore.delete(shortCode);
      throw new Error('Short URL has expired');
    }

    // Update cache
    this.cacheSet(shortCode, record.originalUrl);
    this.recordClick(shortCode);

    return record.originalUrl;
  }

  // Get analytics for a short code
  async getAnalytics(shortCode: string): Promise<Analytics> {
    const record = this.urlStore.get(shortCode);
    if (!record) {
      throw new Error('Short URL not found');
    }

    const clicks = this.clickEvents.filter(e => e.shortCode === shortCode);

    // Clicks by day
    const dayMap = new Map<string, number>();
    for (const click of clicks) {
      const day = click.timestamp.split('T')[0];
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    }
    const clicksByDay = Array.from(dayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top referrers
    const refMap = new Map<string, number>();
    for (const click of clicks) {
      const ref = click.referrer || 'direct';
      refMap.set(ref, (refMap.get(ref) || 0) + 1);
    }
    const topReferrers = Array.from(refMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalClicks: record.clickCount,
      clicksByDay,
      topReferrers,
    };
  }

  // Generate a short code using Base62 encoding
  private generateShortCode(): string {
    this.counter++;
    return this.encodeBase62(this.counter);
  }

  // Base62 encode a number
  private encodeBase62(num: number): string {
    if (num === 0) return URLShortener.BASE62[0];

    let result = '';
    while (num > 0) {
      result = URLShortener.BASE62[num % 62] + result;
      num = Math.floor(num / 62);
    }

    // Pad to minimum 6 characters
    while (result.length < 6) {
      result = URLShortener.BASE62[0] + result;
    }

    return result;
  }

  // Cache operations
  private cacheGet(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.url;
  }

  private cacheSet(key: string, url: string): void {
    if (this.cache.size >= URLShortener.MAX_CACHE_SIZE) {
      // Evict oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      url,
      expiresAt: Date.now() + URLShortener.CACHE_TTL,
    });
  }

  // Record a click event (async in production)
  private recordClick(shortCode: string): void {
    const record = this.urlStore.get(shortCode);
    if (record) {
      record.clickCount++;
    }

    this.clickEvents.push({
      shortCode,
      timestamp: new Date().toISOString(),
      referrer: null,
      userAgent: null,
      ip: null,
    });
  }

  // Validation helpers
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private isValidAlias(alias: string): boolean {
    return /^[a-zA-Z0-9]{4,20}$/.test(alias);
  }
}

export { URLShortener, URLRecord, Analytics, ShortenResult };
