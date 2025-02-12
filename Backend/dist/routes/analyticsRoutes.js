"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const analyticsController_1 = require("../controllers/analyticsController");
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middlewares/validateRequest");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateUser);
// User analytics routes
router.get('/user/:userId', (0, authMiddleware_1.authorizeRoles)('admin', 'instructor'), analyticsController_1.getUserAnalyticsController);
router.get('/user/me', analyticsController_1.getCurrentUserAnalyticsController);
// Platform analytics routes
router.get('/platform', (0, authMiddleware_1.authorizeRoles)('admin'), [
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601(),
    (0, validateRequest_1.validateRequest)(joi_1.default.object({
        startDate: joi_1.default.date().iso(),
        endDate: joi_1.default.date().iso().min(joi_1.default.ref('startDate')),
    }), 'query'),
], analyticsController_1.getPlatformAnalyticsController);
// Report generation
router.post('/reports', (0, authMiddleware_1.authorizeRoles)('admin'), (0, validateRequest_1.validateRequest)(joi_1.default.object({
    type: joi_1.default.string().valid('user', 'platform').required(),
    userId: joi_1.default.string().when('type', {
        is: 'user',
        then: joi_1.default.string().required(),
    }),
    startDate: joi_1.default.date().iso().when('type', {
        is: 'platform',
        then: joi_1.default.required(),
    }),
    endDate: joi_1.default.date().iso().min(joi_1.default.ref('startDate')),
}), 'body'), analyticsController_1.generateReportController);
exports.default = router;
//# sourceMappingURL=analyticsRoutes.js.map