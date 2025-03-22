"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportController = exports.getPlatformAnalyticsController = exports.getCurrentUserAnalyticsController = exports.getUserAnalyticsController = void 0;
const errorHandler_1 = require("./../utils/errorHandler");
const utils_1 = require("../utils");
const analyticsService_1 = require("../services/analyticsService");
const apiResponse_1 = require("../utils/apiResponse");
exports.getUserAnalyticsController = (0, utils_1.catchAsync)(async (req, res) => {
    const userId = req.params.userId;
    const analyticsData = await (0, analyticsService_1.getUserAnalytics)(userId);
    (0, apiResponse_1.sendResponse)(res, 'USER_ANALYTICS_FETCHED', { data: analyticsData });
});
exports.getCurrentUserAnalyticsController = (0, utils_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const analyticsData = await (0, analyticsService_1.getUserAnalytics)(userId);
    (0, apiResponse_1.sendResponse)(res, 'USER_ANALYTICS_FETCHED', { data: analyticsData });
});
const getPlatformAnalyticsController = async (req, res) => {
    try {
        const { startDate, endDate } = validateDateRange(req.query.startDate?.toString(), req.query.endDate?.toString());
        const analytics = await (0, analyticsService_1.getPlatformAnalytics)(startDate, endDate);
        (0, apiResponse_1.sendResponse)(res, 'PLATFORM_ANALYTICS_FETCHED', { data: analytics });
    }
    catch (error) {
        (0, errorHandler_1.createAppError)(error, 500);
    }
};
exports.getPlatformAnalyticsController = getPlatformAnalyticsController;
// Add validation helper
const validateDateRange = (start, end) => {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    if ((startDate && isNaN(startDate.getTime())) ||
        (endDate && isNaN(endDate.getTime()))) {
        throw (0, errorHandler_1.createAppError)('Invalid date format', 400);
    }
    return { startDate, endDate };
};
exports.generateReportController = (0, utils_1.catchAsync)(async (req, res) => {
    const reportData = await (0, analyticsService_1.generateReport)('user', req.params.userId);
    (0, apiResponse_1.sendResponse)(res, 'REPORT_FETCHED', { data: reportData });
});
//# sourceMappingURL=analyticsController.js.map