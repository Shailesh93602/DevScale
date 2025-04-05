import { BaseRouter } from './BaseRouter';
import { DashboardController } from '../controllers/dashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createRateLimiter } from '../middlewares/rateLimiter';

export class DashboardRoutes extends BaseRouter {
  private readonly dashboardController: DashboardController;
  private readonly dashboardLimiter: ReturnType<typeof createRateLimiter>;

  constructor() {
    super();
    this.dashboardController = new DashboardController();
    this.dashboardLimiter = createRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: 20, // 20 requests per minute
      message: 'Too many dashboard requests, please try again later',
    });
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authMiddleware);

    // Apply rate limiter to all dashboard routes
    this.router.use(this.dashboardLimiter);

    this.router.get('/stats', this.dashboardController.getDashboardStats);
    this.router.get(
      '/activities',
      this.dashboardController.getRecentActivities
    );
    this.router.get('/progress', this.dashboardController.getLearningProgress);
    this.router.get('/achievements', this.dashboardController.getAchievements);
  }
}
