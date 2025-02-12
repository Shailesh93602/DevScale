"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageAnalytics = void 0;
const redis_1 = require("../redis");
const logger_1 = __importDefault(require("../../utils/logger"));
class UsageAnalytics {
    static METRICS_KEY = 'usage_metrics';
    static RETENTION_DAYS = 30;
    static async trackRequest(metrics) {
        try {
            await redis_1.RedisClient.zadd(this.METRICS_KEY, metrics.timestamp, JSON.stringify(metrics));
            // Cleanup old data
            const cutoff = Date.now() - this.RETENTION_DAYS * 24 * 60 * 60 * 1000;
            await redis_1.RedisClient.zremrangebyscore(this.METRICS_KEY, 0, cutoff);
            logger_1.default.debug('Usage metrics tracked:', metrics);
        }
        catch (error) {
            logger_1.default.error('Failed to track usage metrics:', error);
        }
    }
    static async getMetrics(startTime, endTime) {
        try {
            const data = await redis_1.RedisClient.zrangebyscore(this.METRICS_KEY, startTime, endTime);
            return data.map((item) => JSON.parse(item));
        }
        catch (error) {
            logger_1.default.error('Failed to retrieve usage metrics:', error);
            return [];
        }
    }
    static async getPopularEndpoints(timeRange = 3600) {
        const startTime = Date.now() - timeRange * 1000;
        const metrics = await this.getMetrics(startTime, Date.now());
        return metrics.reduce((acc, metric) => {
            const key = `${metric.method} ${metric.endpoint}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }
}
exports.UsageAnalytics = UsageAnalytics;
//# sourceMappingURL=usageAnalytics.js.map