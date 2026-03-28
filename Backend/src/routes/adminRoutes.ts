import { Router } from 'express';
import AdminController from '../controllers/adminController.js';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware.js';

import { BaseRouter } from './BaseRouter.js';

export class AdminRoutes extends BaseRouter {
  private readonly adminController: AdminController;

  constructor() {
    super();
    this.adminController = new AdminController();
  }

  protected initializeRoutes(): void {
    // Apply role check to ALL routes in this router
    this.router.use(authMiddleware);
    this.router.use(authorizeRoles('ADMIN'));

    // Dashboard Routes
    this.router.get(
      '/dashboard/metrics',
      this.adminController.getDashboardMetrics
    );

    // User Management Routes
    this.router.get(
      '/users',
      this.adminController.searchUsers
    );

    this.router.patch(
      '/users/:userId/role',
      this.adminController.updateUserRole
    );
    this.router.delete(
      '/users/:userId',
      this.adminController.deleteUser
    );

    // Content Moderation Routes
    this.router.get(
      '/moderation/queue',
      this.adminController.getContentModerationQueue
    );

    this.router.post(
      '/moderation/:contentId',
      this.adminController.moderateContentItem
    );

    // System Configuration Routes
    this.router.patch(
      '/config',
      this.adminController.setConfig
    );

    this.router.get(
      '/config/:category',
      this.adminController.getConfigsByCategory
    );

    // Resource Management Routes
    this.router.post(
      '/resources/allocate',
      this.adminController.allocateResources
    );

    // Analytics and Reporting Routes
    this.router.post(
      '/reports/custom',
      this.adminController.generateCustomReport
    );

    this.router.delete(
      '/roadmaps/:roadmapId',
      this.adminController.deleteRoadmap
    );

    // Audit System Routes
    this.router.get(
      '/audit/logs',
      this.adminController.getSystemAuditLogs
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
