"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const adminController_1 = __importDefault(require("../controllers/adminController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
// import { requirePermission } from '../middlewares/rbacMiddleware';
const BaseRouter_1 = require("./BaseRouter");
class AdminRoutes extends BaseRouter_1.BaseRouter {
    adminController;
    constructor() {
        super();
        this.adminController = new adminController_1.default();
    }
    initializeRoutes() {
        // Dashboard Routes
        this.router.get('/dashboard/metrics', authMiddleware_1.authMiddleware, 
        // requirePermission('dashboard', 'read'),
        this.adminController.getDashboardMetrics);
        // User Management Routes
        this.router.get('/users', authMiddleware_1.authMiddleware, 
        // requirePermission('users', 'read'),
        this.adminController.searchUsers);
        this.router.patch('/users/:userId/role', authMiddleware_1.authMiddleware, 
        // requirePermission('users', 'update'),
        this.adminController.updateUserRole);
        // Content Moderation Routes
        this.router.get('/moderation/queue', authMiddleware_1.authMiddleware, 
        // requirePermission('moderation', 'read'),
        this.adminController.getContentModerationQueue);
        this.router.post('/moderation/:contentId', authMiddleware_1.authMiddleware, 
        // requirePermission('moderation', 'update'),
        this.adminController.moderateContentItem);
        // System Configuration Routes
        this.router.patch('/config', authMiddleware_1.authMiddleware, 
        // requirePermission('config', 'update'),
        this.adminController.setConfig);
        this.router.get('/config/:category', authMiddleware_1.authMiddleware, 
        // requirePermission('config', 'read'),
        this.adminController.getConfigsByCategory);
        // Resource Management Routes
        this.router.post('/resources/allocate', authMiddleware_1.authMiddleware, 
        // requirePermission('resources', 'update'),
        this.adminController.allocateResources);
        // Analytics and Reporting Routes
        this.router.post('/reports/custom', authMiddleware_1.authMiddleware, 
        // requirePermission('analytics', 'read'),
        this.adminController.generateCustomReport);
        // Audit System Routes
        this.router.get('/audit/logs', authMiddleware_1.authMiddleware, 
        // requirePermission('audit', 'read'),
        this.adminController.getSystemAuditLogs);
    }
    getRouter() {
        return this.router;
    }
}
exports.AdminRoutes = AdminRoutes;
//# sourceMappingURL=adminRoutes.js.map