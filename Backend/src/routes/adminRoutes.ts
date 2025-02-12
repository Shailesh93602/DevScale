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
import { authenticateUser } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();

// Dashboard Routes
router.get(
  '/dashboard/metrics',
  authenticateUser,
  requirePermission('dashboard', 'read'),
  getDashboardMetricsHandler
);

// User Management Routes
router.get(
  '/users',
  authenticateUser,
  requirePermission('users', 'read'),
  searchUsersController
);

router.patch(
  '/users/role',
  authenticateUser,
  requirePermission('users', 'update'),
  updateUserRoleController
);

// Content Moderation Routes
router.get(
  '/moderation/pending',
  authenticateUser,
  requirePermission('moderation', 'read'),
  getPendingContentHandler
);

router.post(
  '/moderation/moderate',
  authenticateUser,
  requirePermission('moderation', 'update'),
  moderateContent
);

// System Configuration Routes
router.patch(
  '/config',
  authenticateUser,
  requirePermission('config', 'update'),
  updateConfig
);

router.get(
  '/config/:category',
  authenticateUser,
  requirePermission('config', 'read'),
  getConfigsByCategory
);

// Resource Management Routes
router.post(
  '/resources/allocate',
  authenticateUser,
  requirePermission('resources', 'update'),
  allocateResources
);

// Analytics Routes
router.post(
  '/analytics/reports',
  authenticateUser,
  requirePermission('analytics', 'read'),
  generateReport
);

// Audit System Routes
router.get(
  '/audit/logs',
  authenticateUser,
  requirePermission('audit', 'read'),
  getAuditLogs
);

export default router;
