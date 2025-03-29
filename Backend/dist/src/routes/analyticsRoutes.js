"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const analyticsController_1 = __importDefault(require("../controllers/analyticsController"));
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middlewares/validateRequest");
const joi_1 = __importDefault(require("joi"));
class AnalyticsRoutes {
    router;
    analyticsController;
    constructor() {
        this.router = (0, express_1.Router)();
        this.analyticsController = new analyticsController_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Apply auth middleware to all routes
        this.router.use(authMiddleware_1.authMiddleware);
        // User analytics routes
        this.router.get('/user/:userId', (0, authMiddleware_1.authorizeRoles)('admin', 'instructor'), this.analyticsController.getUserAnalytics);
        this.router.get('/user/me', this.analyticsController.getCurrentUserAnalytics);
        // Platform analytics routes
        this.router.get('/platform', (0, authMiddleware_1.authorizeRoles)('admin'), [
            (0, express_validator_1.query)('startDate').optional().isISO8601(),
            (0, express_validator_1.query)('endDate').optional().isISO8601(),
            (0, validateRequest_1.validateRequest)(joi_1.default.object({
                startDate: joi_1.default.date().iso(),
                endDate: joi_1.default.date().iso().min(joi_1.default.ref('startDate')),
            }), 'query'),
        ], this.analyticsController.getPlatformAnalytics);
        // Report generation routes
        this.router.get('/report/:reportType', (0, authMiddleware_1.authorizeRoles)('admin'), [
            (0, express_validator_1.query)('startDate').optional().isISO8601(),
            (0, express_validator_1.query)('endDate').optional().isISO8601(),
            (0, express_validator_1.query)('userId').optional().isString(),
            (0, express_validator_1.query)('type').optional().isString(),
            (0, express_validator_1.query)('status').optional().isString(),
            (0, validateRequest_1.validateRequest)(joi_1.default.object({
                startDate: joi_1.default.date().iso(),
                endDate: joi_1.default.date().iso().min(joi_1.default.ref('startDate')),
                userId: joi_1.default.string().optional(),
                type: joi_1.default.string().optional(),
                status: joi_1.default.string().optional(),
            }), 'query'),
        ], this.analyticsController.generateReport);
    }
    getRouter() {
        return this.router;
    }
}
exports.AnalyticsRoutes = AnalyticsRoutes;
//# sourceMappingURL=analyticsRoutes.js.map