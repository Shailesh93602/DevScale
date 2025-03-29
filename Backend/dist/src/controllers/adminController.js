"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../types/response");
const adminDashboardRepository_1 = __importDefault(require("../repositories/adminDashboardRepository"));
const catchAsync_1 = require("../utils/catchAsync");
const createAppError_1 = require("../utils/createAppError");
const sendResponse_1 = require("../utils/sendResponse");
const userRepository_1 = __importDefault(require("@/repositories/userRepository"));
const systemConfigRepository_1 = __importDefault(require("@/repositories/systemConfigRepository"));
class AdminController {
    adminDashboardRepo;
    userRepo;
    systemConfigRepo;
    constructor() {
        this.adminDashboardRepo = new adminDashboardRepository_1.default();
        this.userRepo = new userRepository_1.default();
        this.systemConfigRepo = new systemConfigRepository_1.default();
    }
    // Dashboard and Metrics
    getDashboardMetrics = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const metrics = await this.adminDashboardRepo.getDashboardMetrics();
        (0, sendResponse_1.sendResponse)(res, response_1.ResponseType.METRICS_FETCHED, metrics);
    });
    // User Management
    searchUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const users = await this.userRepo.searchUsers(req.query);
        (0, sendResponse_1.sendResponse)(res, response_1.ResponseType.USERS_FETCHED, users);
    });
    updateUserRole = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { userId } = req.params;
        const { roleId } = req.body;
        const user = await this.userRepo.updateUserRole(userId, roleId);
        (0, sendResponse_1.sendResponse)(res, response_1.ResponseType.USER_UPDATED, user);
    });
    // Configuration Management
    setConfig = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { category, key, value } = req.body;
        const config = await this.systemConfigRepo.setConfig({
            category,
            key,
            value,
        });
        (0, sendResponse_1.sendResponse)(res, response_1.ResponseType.CONFIG_UPDATED, config);
    });
    getConfigsByCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { category } = req.params;
        const configs = await this.systemConfigRepo.findFirst({
            where: { category },
        });
        (0, sendResponse_1.sendResponse)(res, response_1.ResponseType.CONFIGS_FETCHED, configs);
    });
    // Resource Allocation
    allocateResources = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const allocation = await this.adminDashboardRepo.allocateResources(req.body);
        (0, sendResponse_1.sendResponse)(res, response_1.ResponseType.RESOURCES_ALLOCATED, allocation);
    });
    // Reporting
    generateCustomReport = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const report = await this.adminDashboardRepo.generateCustomReport(req.body);
        if (req.body.format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
            res.send(report);
        }
        else {
            (0, sendResponse_1.sendResponse)(res, response_1.ResponseType.REPORT_GENERATED, report);
        }
    });
    // Auditing and Logging
    getSystemAuditLogs = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const logs = await this.adminDashboardRepo.getSystemAuditLogs();
        (0, sendResponse_1.sendResponse)(res, response_1.ResponseType.AUDIT_LOGS_FETCHED, logs);
    });
    // Content Moderation
    getContentModerationQueue = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const queue = await this.adminDashboardRepo.getContentModerationQueue();
        (0, sendResponse_1.sendResponse)(res, response_1.ResponseType.MODERATION_QUEUE_FETCHED, queue);
    });
    moderateContentItem = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { contentId } = req.params;
        const { action, reason } = req.body;
        const moderatorId = req.user?.id;
        if (!moderatorId) {
            throw (0, createAppError_1.createAppError)('Unauthorized: Moderator ID is required', 401);
        }
        const content = await this.adminDashboardRepo.moderateContentItem(contentId, action, reason, moderatorId);
        (0, sendResponse_1.sendResponse)(res, response_1.ResponseType.CONTENT_MODERATED, content);
    });
}
exports.default = AdminController;
//# sourceMappingURL=adminController.js.map