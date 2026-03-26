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

export const cacheResponse = (options: CacheOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip cache based on condition
      if (options.condition && !options.condition(req)) {
        return next();
      }

      // Generate cache key
      const cacheKey =
        typeof options.key === 'function'
          ? options.key(req)
          : options.key || `${req.method}:${req.originalUrl}`;

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
          // Only cache if body is not null/undefined
          if (body) {
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
