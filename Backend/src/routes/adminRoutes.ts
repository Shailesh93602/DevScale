import { Router } from 'express';
import AdminController from '../controllers/adminController';
import { authMiddleware } from '../middlewares/authMiddleware';
// import { requirePermission } from '../middlewares/rbacMiddleware';

import { BaseRouter } from './BaseRouter';

export class AdminRoutes extends BaseRouter {
  private readonly adminController: AdminController;

  constructor() {
    super();
    this.adminController = new AdminController();
  }

  protected initializeRoutes(): void {
    // Dashboard Routes
    this.router.get(
      '/dashboard/metrics',
      authMiddleware,
      // requirePermission('dashboard', 'read'),
      this.adminController.getDashboardMetrics
    );

    // User Management Routes
    this.router.get(
      '/users',
      authMiddleware,
      // requirePermission('users', 'read'),
      this.adminController.searchUsers
    );

    this.router.patch(
      '/users/:userId/role',
      authMiddleware,
      // requirePermission('users', 'update'),
      this.adminController.updateUserRole
    );

    // Content Moderation Routes
    this.router.get(
      '/moderation/queue',
      authMiddleware,
      // requirePermission('moderation', 'read'),
      this.adminController.getContentModerationQueue
    );

    this.router.post(
      '/moderation/:contentId',
      authMiddleware,
      // requirePermission('moderation', 'update'),
      this.adminController.moderateContentItem
    );

    // System Configuration Routes
    this.router.patch(
      '/config',
      authMiddleware,
      // requirePermission('config', 'update'),
      this.adminController.setConfig
    );

    this.router.get(
      '/config/:category',
      authMiddleware,
      // requirePermission('config', 'read'),
      this.adminController.getConfigsByCategory
    );

    // Resource Management Routes
    this.router.post(
      '/resources/allocate',
      authMiddleware,
      // requirePermission('resources', 'update'),
      this.adminController.allocateResources
    );

    // Analytics and Reporting Routes
    this.router.post(
      '/reports/custom',
      authMiddleware,
      // requirePermission('analytics', 'read'),
      this.adminController.generateCustomReport
    );

    // Audit System Routes
    this.router.get(
      '/audit/logs',
      authMiddleware,
      // requirePermission('audit', 'read'),
      this.adminController.getSystemAuditLogs
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
