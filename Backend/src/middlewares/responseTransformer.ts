import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface TransformOptions {
  transform: (data: unknown) => unknown;
  condition?: (req: Request) => boolean;
}

export const transformResponse = (options: TransformOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip transform based on condition
      if (options.condition && !options.condition(req)) {
        return next();
      }

      // Override json function to transform response
      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        const transformedBody = options.transform(body);
        return originalJson(transformedBody);
      };

      next();
    } catch (error) {
      logger.error('Response transform failed:', error);
      next();
    }
  };
};

// Common transformers
export const sanitizeResponse = transformResponse({
  transform: (data) => {
    const sanitize = (obj: unknown): unknown => {
      if (!obj || typeof obj !== 'object') return obj;

      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith('_') || key === 'password') continue;
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    };

    return sanitize(data);
  },
});

export const camelCaseResponse = transformResponse({
  transform: (data) => {
    const toCamelCase = (str: string) =>
      str.replaceAll(/_([a-z])/g, (g) => g[1].toUpperCase());

    const convert = (obj: unknown): unknown => {
      if (!obj || typeof obj !== 'object') return obj;

      if (Array.isArray(obj)) {
        return obj.map(convert);
      }

      const converted: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        converted[toCamelCase(key)] = convert(value);
      }
      return converted;
    };

    return convert(data);
  },
});
