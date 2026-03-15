import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to protect against CSRF attacks.
 * It checks the 'X-CSRF-TOKEN' header against the token stored in req.session.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const unsafeMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  // 1. Skip validation for safe methods
  if (!unsafeMethods.includes(req.method)) {
    return next();
  }

  // 2. Extract token from custom header
  const headerToken = req.get('X-CSRF-TOKEN');
  
  // 3. Extract token from session
  // Note: Cast to any as session properties are dynamic
  const sessionToken = (req as any).session?.csrfToken;

  // 4. Validate
  if (!headerToken || !sessionToken || headerToken !== sessionToken) {
    res.status(403).send('Invalid or missing CSRF token');
    return;
  }

  // 5. Success
  next();
}
