import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import logger from '../utils/logger.js';

/**
 * CSRF Double-Submit Token Pattern Middleware
 *
 * Sets a non-httpOnly cookie 'XSRF-TOKEN' that the client can read and send back
 * in the 'X-XSRF-TOKEN' header for any state-changing request (POST, PUT, DELETE, PATCH).
 *
 * Enforce SameSite=Strict to mitigate CSRF in modern browsers.
 */

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'x-xsrf-token';

/**
 * Ensures the CSRF cookie is set and up to date.
 * Should be called on stable GET requests or after login.
 */
export const setCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Rotate/Set token if it doesn't exist
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Client needs to read this to send it back in headers
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
  next();
};

/**
 * Verifies the CSRF token for state-changing methods.
 */
export const verifyCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const method = req.method.toUpperCase();
  const unprotectedMethods = ['GET', 'HEAD', 'OPTIONS'];

  if (unprotectedMethods.includes(method)) {
    next();
    return;
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] || req.body?._csrf;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    logger.warn('CSRF verification failed', {
      ip: req.ip,
      path: req.path,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
    });

    res.status(403).json({
      message: 'CSRF token validation failed. Please refresh the page.',
      code: 'CSRF_INVALID',
    });
    return;
  }

  next();
};
