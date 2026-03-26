import { BaseRouter } from './BaseRouter';
import { authMiddleware } from '../middlewares/authMiddleware';
import { logout, refreshCache } from '../controllers/authController';

export class AuthRoutes extends BaseRouter {
  protected initializeRoutes(): void {
    // POST /api/v1/auth/logout — blocklist the current JWT in Redis
    this.router.post('/logout', authMiddleware, logout);

    // POST /api/v1/auth/refresh-cache — clear auth cache after profile changes
    this.router.post('/refresh-cache', authMiddleware, refreshCache);
  }
}
