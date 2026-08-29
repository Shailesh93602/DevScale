import { BaseRouter } from './BaseRouter';
import { authMiddleware } from '../middlewares/authMiddleware';
import { verifyCsrfToken } from '../middlewares/csrfMiddleware.js';
import {
  logout,
  refreshCache,
  refreshToken,
  setRefreshCookie,
} from '../controllers/authController';
import { authLimiter } from '../middlewares/rateLimiter';
import { checkAccountLockout } from '../middlewares/accountLockout';
import { validateRequest } from '../middlewares/validateRequest';
import { setRefreshCookieSchema } from '../validations/authValidations';

export class AuthRoutes extends BaseRouter {
  protected initializeRoutes(): void {
    // POST /api/v1/auth/logout — blocklist the current JWT in Redis
    // authLimiter: 5 req / 15 min per IP — prevents blocklist-flooding
    this.router.post('/logout', authLimiter, authMiddleware, logout);

    // POST /api/v1/auth/refresh — exchange httpOnly refresh cookie for new access token
    // checkAccountLockout: blocks IP after 10 failed attempts (30-min lock)
    // authLimiter: 5 req / 15 min per IP (rate limit on top of lockout)
    // verifyCsrfToken is applied HERE rather than globally. This is the one
    // route where a cookie authenticates (`sb-refresh-token`), so it is the one
    // route with anything for CSRF to protect. Everywhere else authenticates
    // with an `Authorization: Bearer` header, which a forged cross-origin
    // request cannot set. See the note in main.ts.
    this.router.post(
      '/refresh',
      checkAccountLockout,
      authLimiter,
      verifyCsrfToken,
      refreshToken
    );

    // POST /api/v1/auth/set-refresh-cookie — called once after Supabase login
    // stores the refresh token in an httpOnly cookie so JS cannot read it
    this.router.post(
      '/set-refresh-cookie',
      authLimiter,
      authMiddleware,
      validateRequest(setRefreshCookieSchema),
      setRefreshCookie
    );

    // POST /api/v1/auth/refresh-cache — clear auth cache after profile changes
    this.router.post('/refresh-cache', authMiddleware, refreshCache);
  }
}
