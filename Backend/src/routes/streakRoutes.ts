import { BaseRouter } from './BaseRouter';
import { StreakController } from '../controllers/streakController';
import { authMiddleware } from '../middlewares/authMiddleware';
import * as rateLimiter from '../middlewares/rateLimiter';
import { validateRequest } from '../middlewares/validateRequest';
import { updateStreakSchema } from '../validations/streakValidations';

export class StreakRoutes extends BaseRouter {
  private readonly streakController: StreakController;
  private readonly streakUpdateLimiter: ReturnType<
    typeof rateLimiter.createRateLimiter
  >;

  constructor() {
    super();
    this.streakController = new StreakController();
    this.streakUpdateLimiter = rateLimiter.createRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: 10, // 10 requests per minute
      message: 'Too many streak updates, please try again later',
    });
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    // Apply authentication to all routes
    this.router.use(authMiddleware);

    this.router.post(
      '/update',
      this.streakUpdateLimiter,
      validateRequest(updateStreakSchema),
      this.streakController.updateStreak
    );

    this.router.get('/stats', this.streakController.getStreakStats);
    this.router.get(
      '/weekly-activity',
      this.streakController.getWeeklyActivity
    );
  }
}
