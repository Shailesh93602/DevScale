"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const errorTracker_1 = require("./errorTracker");
const usageAnalytics_1 = require("./usageAnalytics");
const logger_1 = __importDefault(require("../../utils/logger"));
class DashboardService {
    static async getDashboardMetrics() {
        try {
            const [errorStats, usageMetrics] = await Promise.all([
                errorTracker_1.ErrorTracker.getErrorStats(),
                usageAnalytics_1.UsageAnalytics.getPopularEndpoints(),
            ]);
            return {
                performance: {
                    requestLatencies: await this.getLatencies(),
                    activeConnections: await this.getActiveConnections(),
                    memoryUsage: process.memoryUsage().heapUsed,
                },
                errors: {
                    recentErrors: errorStats.map((error) => ({
                        message: error.message,
                        count: error.count,
                        lastOccurrence: error.lastOccurrence,
                    })),
                    errorRate: this.calculateErrorRate(errorStats),
                },
                usage: {
                    popularEndpoints: usageMetrics,
                    totalRequests: Object.values(usageMetrics).reduce((sum, count) => sum + count, 0),
                    activeUsers: await this.getActiveUsers(),
                },
            };
        }
        catch (error) {
            logger_1.default.error('Failed to generate dashboard metrics:', error);
            throw error;
        }
    }
    static async getLatencies() {
        // Implementation would depend on your metrics storage
        return {};
    }
    static async getActiveConnections() {
        // Implementation would depend on your connection tracking
        return 0;
    }
    static async getActiveUsers() {
        // Implementation would depend on your user session tracking
        return 0;
    }
    static calculateErrorRate(errors) {
        const totalErrors = errors.reduce((sum, error) => sum + error.count, 0);
        const timeWindow = 3600; // 1 hour
        return totalErrors / timeWindow;
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboardService.js.map