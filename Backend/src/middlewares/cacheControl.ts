import { Request, Response, NextFunction } from 'express';
import { getCache, setCache, deleteCache } from '../services/cacheService';
import logger from '../utils/logger';
import { sendResponse } from '../utils/apiResponse';

interface CacheOptions {
  duration: number; // Cache duration in seconds
  key?: string | ((req: Request) => string);
  condition?: (req: Request) => boolean;
}

// Helper function to safely stringify objects with circular references
const safeStringify = (obj: unknown): string => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  });
};

// Built from the validated query, so unknown params cannot mint new keys.
const defaultKey = (req: Request): string => {
  const query = req.query as Record<string, unknown>;
  const sorted = Object.keys(query)
    .sort()
    .map((k) => [k, query[k]]);
  return `${req.method}:${req.baseUrl}${req.path}:${JSON.stringify(sorted)}`;
};

export const cacheResponse = (options: CacheOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip cache based on condition
      if (options.condition && !options.condition(req)) {
        return next();
      }

      // `http:` keeps these envelopes apart from repository-level cache keys.
      const cacheKey = `http:${
        typeof options.key === 'function'
          ? options.key(req)
          : options.key || defaultKey(req)
      }`;

      // Try to get from cache
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        // ✅ Replay the original response body verbatim.
        // Do NOT re-wrap in sendResponse('CACHE_HIT', { data: cachedData }) — that
        // creates a double-nested envelope { data: { success, data: realArray, meta } }
        // which breaks the frontend that reads response.data.data expecting the plain array.
        const body =
          typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
        return res.json(body);
      }

      // Store original json function
      const originalJson = res.json;

      // Override json function to cache response
      res.json = function (body: unknown) {
        try {
          // Never cache an error envelope: the replay path answers 200.
          if (body && res.statusCode >= 200 && res.statusCode < 300) {
            const stringifiedBody = safeStringify(body);
            setCache(cacheKey, stringifiedBody, {
              ttl: options.duration,
            }).catch((error) => logger.error('Cache set failed:', error));
          }
        } catch (error) {
          logger.error('Failed to cache response:', error);
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

export const clearCache = (pattern: string) => {
  return async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      await deleteCache(pattern);
      sendResponse(_res, 'CACHE_CLEARED');
    } catch (error) {
      logger.error('Cache clear failed:', error);
      next();
    }
  };
};
