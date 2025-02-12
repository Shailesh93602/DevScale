import { Request, Response, NextFunction } from 'express';
import { getCache, setCache, deleteCache } from '../services/cacheService';
import logger from '../utils/logger';

interface CacheOptions {
  duration: number; // Cache duration in seconds
  key?: string | ((req: Request) => string);
  condition?: (req: Request) => boolean;
}

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
        return res.json(
          typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData
        );
      }

      // Store original send function
      const originalSend = res.json;

      // Override send function to cache response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res.json = function (body: any) {
        setCache(cacheKey, JSON.stringify(body), { ttl: options.duration }).catch(
          (error) => logger.error('Cache set failed:', error)
        );
        return originalSend.call(this, body);
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
      next();
    } catch (error) {
      logger.error('Cache clear failed:', error);
      next();
    }
  };
};
