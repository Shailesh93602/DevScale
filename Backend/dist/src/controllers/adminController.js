"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminControllers = exports.getAuditLogs = exports.generateReport = exports.allocateResources = exports.getConfigsByCategory = exports.updateConfig = exports.moderateContent = exports.getPendingContentHandler = exports.updateUserRoleController = exports.searchUsersController = exports.getDashboardMetricsHandler = void 0;
const adminDashboardService_1 = require("../services/adminDashboardService");
const contentModerationService_1 = require("../services/contentModerationService");
const systemConfigService_1 = require("../services/systemConfigService");
const adminResourceService_1 = require("../services/adminResourceService");
const adminReportingService_1 = require("../services/adminReportingService");
const auditService_1 = require("../services/auditService");
const validateRequest_1 = require("../middlewares/validateRequest");
const adminValidations_1 = require("../validations/adminValidations");
const utils_1 = require("../utils");
const apiResponse_1 = require("../utils/apiResponse");
// Dashboard Controllers
exports.getDashboardMetricsHandler = (0, utils_1.catchAsync)(async (req, res) => {
    const metrics = await (0, adminDashboardService_1.getDashboardMetrics)();
    (0, apiResponse_1.sendResponse)(res, 'METRICS_FETCHED', { data: metrics });
});
// User Management Controllers
exports.searchUsersController = (0, utils_1.catchAsync)(async (req, res) => {
    (0, validateRequest_1.validateRequest)(adminValidations_1.userSearchSchema, 'query');
    const users = await (0, adminDashboardService_1.searchUsers)(req.query);
    (0, apiResponse_1.sendResponse)(res, 'USERS_FETCHED', { data: users });
});
exports.updateUserRoleController = (0, utils_1.catchAsync)(async (req, res) => {
    const { userId, roleId } = req.body;
    const user = await (0, adminDashboardService_1.updateUserRole)(userId, roleId);
    (0, apiResponse_1.sendResponse)(res, 'USER_ROLE_UPDATED', { data: user });
});
// Content Moderation Controllers
exports.getPendingContentHandler = (0, utils_1.catchAsync)(async (req, res) => {
    const content = await (0, contentModerationService_1.getPendingContent)(req.query.type, Number(req.query.page), Number(req.query.limit));
    (0, apiResponse_1.sendResponse)(res, 'PENDING_CONTENT_FETCHED', { data: content });
});
exports.moderateContent = (0, utils_1.catchAsync)(async (req, res) => {
    const { content_id, content_type, status, moderations } = req.body;
    const result = await (0, contentModerationService_1.moderateContent)({
        content_id,
        content_type,
        status,
        moderator_id: req.user?.id,
        moderations,
    });
    (0, apiResponse_1.sendResponse)(res, 'CONTENT_MODERATED', { data: result });
});
// System Configuration Controllers
exports.updateConfig = (0, utils_1.catchAsync)(async (req, res) => {
    (0, validateRequest_1.validateRequest)(adminValidations_1.configUpdateSchema, req.body);
    const config = await (0, systemConfigService_1.setConfig)(req.body);
    (0, apiResponse_1.sendResponse)(res, 'CONFIG_UPDATED', { data: config });
});
exports.getConfigsByCategory = (0, utils_1.catchAsync)(async (req, res) => {
    const { category } = req.params;
    const configs = await (0, systemConfigService_1.getConfigsByCategory)(category);
    (0, apiResponse_1.sendResponse)(res, 'CONFIGS_FETCHED', { data: configs });
});
// Resource Management Controllers
exports.allocateResources = (0, utils_1.catchAsync)(async (req, res) => {
    (0, validateRequest_1.validateRequest)(adminValidations_1.resourceAllocationSchema, req.body);
    const { resourceType, resourceId, allocation } = req.body;
    await (0, adminResourceService_1.allocateResources)(resourceType, resourceId, allocation);
    (0, apiResponse_1.sendResponse)(res, 'RESOURCES_ALLOCATED');
});
// Analytics Controllers
exports.generateReport = (0, utils_1.catchAsync)(async (req, res) => {
    (0, validateRequest_1.validateRequest)(adminValidations_1.reportConfigSchema, req.body);
    const report = await (0, adminReportingService_1.generateCustomReport)(req.body);
    (0, apiResponse_1.sendResponse)(res, 'REPORT_GENERATED', { data: report });
});
// Audit System Controllers
exports.getAuditLogs = (0, utils_1.catchAsync)(async (req, res) => {
    const logs = await (0, auditService_1.getAdminAuditLogs)(req.query, Number(req.query.page), Number(req.query.limit));
    (0, apiResponse_1.sendResponse)(res, 'AUDIT_LOGS_FETCHED', { data: logs });
});
// Export all handlers
exports.adminControllers = {
    getDashboardMetricsHandler: exports.getDashboardMetricsHandler,
    searchUsers: adminDashboardService_1.searchUsers,
    updateUserRole: adminDashboardService_1.updateUserRole,
    getPendingContent: exports.getPendingContentHandler,
    moderateContent: exports.moderateContent,
    updateConfig: exports.updateConfig,
    getConfigsByCategory: exports.getConfigsByCategory,
    allocateResources: exports.allocateResources,
    generateReport: exports.generateReport,
    getAuditLogs: exports.getAuditLogs,
};
//# sourceMappingURL=adminController.js.map