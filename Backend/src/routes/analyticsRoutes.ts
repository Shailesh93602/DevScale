import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import AnalyticsController from '../controllers/analyticsController';
import { query } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest';
import Joi from 'joi';

export class AnalyticsRoutes {
  private readonly router: Router;
  private readonly analyticsController: AnalyticsController;

  constructor() {
    this.router = Router();
    this.analyticsController = new AnalyticsController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Apply auth middleware to all routes
    this.router.use(authMiddleware);

    // User analytics routes
    this.router.get(
      '/user/:userId',
      // authorizeRoles('admin', 'instructor'),
      this.analyticsController.getUserAnalytics
    );

    this.router.get(
      '/user/me',
      this.analyticsController.getCurrentUserAnalytics
    );

    // Platform analytics routes
    this.router.get(
      '/platform',
      authorizeRoles('admin'),
      [
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        validateRequest(
          Joi.object({
            startDate: Joi.date().iso(),
            endDate: Joi.date().iso().min(Joi.ref('startDate')),
          }),
          'query'
        ),
      ],
      this.analyticsController.getPlatformAnalytics
    );

    // Report generation routes
    this.router.get(
      '/report/:reportType',
      authorizeRoles('admin'),
      [
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        query('userId').optional().isString(),
        query('type').optional().isString(),
        query('status').optional().isString(),
        validateRequest(
          Joi.object({
            startDate: Joi.date().iso(),
            endDate: Joi.date().iso().min(Joi.ref('startDate')),
            userId: Joi.string().optional(),
            type: Joi.string().optional(),
            status: Joi.string().optional(),
          }),
          'query'
        ),
      ],
      this.analyticsController.generateReport
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
