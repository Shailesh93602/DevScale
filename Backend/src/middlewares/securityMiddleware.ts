import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import csrf from 'csurf';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import { Schema, ValidationErrorItem } from 'joi';
// XSS Protection middleware
export const xssProtection = xss();

// Parameter Pollution Protection
export const parameterProtection = hpp({
  whitelist: ['sort', 'page', 'limit', 'fields'], // Allow these query params to be duplicated
});

// CSRF Protection
export const csrfProtection = csrf({ cookie: true });

// Custom Security Headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.API_URL || ''],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

// Input Validation Middleware
export const validateInput = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errors = error.details.map(
          (err: ValidationErrorItem) => err.message
        );
        throw createAppError('Validation failed', 400, { errors });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// SQL Injection Prevention
export const sqlInjectionPrevention = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sqlInjectionPattern =
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)|(['"])/gi;

  const checkForSQLInjection = (obj: Record<string, unknown>): boolean => {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && sqlInjectionPattern.test(obj[key])) {
        return true;
      } else if (typeof obj[key] === 'object') {
        return checkForSQLInjection(obj[key] as Record<string, unknown>);
      }
    }
    return false;
  };

  if (
    checkForSQLInjection(req.body) ||
    checkForSQLInjection(req.query) ||
    checkForSQLInjection(req.params)
  ) {
    logger.warn('SQL Injection attempt detected', {
      ip: req.ip,
      path: req.path,
      body: req.body,
      query: req.query,
      params: req.params,
    });
    throw createAppError('Invalid input detected', 400);
  }

  next();
};

// Security Audit Logging
export const securityAuditLog = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auditData = {
    timestamp: new Date(),
    ip: req.ip,
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
    user: req.user?.id || 'anonymous',
  };

  logger.info('Security audit log', auditData);
  next();
};
