import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Compression middleware
export const compressionMiddleware = compression();

// Rate limiting middleware
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Cache control middleware
export const cacheControlMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if response has cache control headers
  if (res.locals.cacheControl) {
    res.set('Cache-Control', res.locals.cacheControl);
  }

  // Check if response has etag
  if (res.locals.etag) {
    res.set('ETag', res.locals.etag);

    // Check if client sent If-None-Match header
    const clientEtag = req.get('If-None-Match');
    if (clientEtag === res.locals.etag) {
      return res.status(304).end();
    }
  }

  next();
};

// Performance headers middleware
export const performanceHeadersMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  // Add security headers
  res.set({
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
  });

  next();
};

// Response time middleware
export const responseTimeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    res.set('X-Response-Time', `${duration}ms`);
  });

  next();
};
