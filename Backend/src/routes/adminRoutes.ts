import { Router } from 'express';
import {
  allocateResources,
  generateReport,
  getAuditLogs,
  getConfigsByCategory,
  getDashboardMetricsHandler,
  getPendingContentHandler,
  moderateContent,
  searchUsersController,
  updateConfig,
  updateUserRoleController,
} from '../controllers/adminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();

// Dashboard Routes
router.get(
  '/dashboard/metrics',
  authMiddleware,
  requirePermission('dashboard', 'read'),
  getDashboardMetricsHandler
);

// User Management Routes
router.get(
  '/users',
  authMiddleware,
  requirePermission('users', 'read'),
  searchUsersController
);

router.patch(
  '/users/role',
  authMiddleware,
  requirePermission('users', 'update'),
  updateUserRoleController
);

// Content Moderation Routes
router.get(
  '/moderation/pending',
  authMiddleware,
  requirePermission('moderation', 'read'),
  getPendingContentHandler
);

router.post(
  '/moderation/moderate',
  authMiddleware,
  requirePermission('moderation', 'update'),
  moderateContent
);

// System Configuration Routes
router.patch(
  '/config',
  authMiddleware,
  requirePermission('config', 'update'),
  updateConfig
);

router.get(
  '/config/:category',
  authMiddleware,
  requirePermission('config', 'read'),
  getConfigsByCategory
);

// Resource Management Routes
router.post(
  '/resources/allocate',
  authMiddleware,
  requirePermission('resources', 'update'),
  allocateResources
);

// Analytics Routes
router.post(
  '/analytics/reports',
  authMiddleware,
  requirePermission('analytics', 'read'),
  generateReport
);

// Audit System Routes
router.get(
  '/audit/logs',
  authMiddleware,
  requirePermission('audit', 'read'),
  getAuditLogs
);

export default router;
