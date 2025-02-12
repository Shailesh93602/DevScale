"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const rbacMiddleware_1 = require("../middlewares/rbacMiddleware");
const router = (0, express_1.Router)();
// Dashboard Routes
router.get('/dashboard/metrics', authMiddleware_1.authenticateUser, (0, rbacMiddleware_1.requirePermission)('dashboard', 'read'), adminController_1.getDashboardMetricsHandler);
// User Management Routes
router.get('/users', authMiddleware_1.authenticateUser, (0, rbacMiddleware_1.requirePermission)('users', 'read'), adminController_1.searchUsersController);
router.patch('/users/role', authMiddleware_1.authenticateUser, (0, rbacMiddleware_1.requirePermission)('users', 'update'), adminController_1.updateUserRoleController);
// Content Moderation Routes
router.get('/moderation/pending', authMiddleware_1.authenticateUser, (0, rbacMiddleware_1.requirePermission)('moderation', 'read'), adminController_1.getPendingContentHandler);
router.post('/moderation/moderate', authMiddleware_1.authenticateUser, (0, rbacMiddleware_1.requirePermission)('moderation', 'update'), adminController_1.moderateContent);
// System Configuration Routes
router.patch('/config', authMiddleware_1.authenticateUser, (0, rbacMiddleware_1.requirePermission)('config', 'update'), adminController_1.updateConfig);
router.get('/config/:category', authMiddleware_1.authenticateUser, (0, rbacMiddleware_1.requirePermission)('config', 'read'), adminController_1.getConfigsByCategory);
// Resource Management Routes
router.post('/resources/allocate', authMiddleware_1.authenticateUser, (0, rbacMiddleware_1.requirePermission)('resources', 'update'), adminController_1.allocateResources);
// Analytics Routes
router.post('/analytics/reports', authMiddleware_1.authenticateUser, (0, rbacMiddleware_1.requirePermission)('analytics', 'read'), adminController_1.generateReport);
// Audit System Routes
router.get('/audit/logs', authMiddleware_1.authenticateUser, (0, rbacMiddleware_1.requirePermission)('audit', 'read'), adminController_1.getAuditLogs);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map