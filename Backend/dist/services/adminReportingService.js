"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCustomReport = generateCustomReport;
exports.analyzeTrends = analyzeTrends;
exports.getPerformanceReport = getPerformanceReport;
exports.getPageViewAnalytics = getPageViewAnalytics;
exports.getFeatureUsageAnalytics = getFeatureUsageAnalytics;
exports.getSessionAnalytics = getSessionAnalytics;
exports.getUserPathAnalytics = getUserPathAnalytics;
exports.getApiPerformanceMetrics = getApiPerformanceMetrics;
exports.getErrorRateMetrics = getErrorRateMetrics;
exports.getResourceUsageMetrics = getResourceUsageMetrics;
exports.getResponseTimeDistribution = getResponseTimeDistribution;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const json2csv_1 = require("json2csv");
const prisma = new client_1.PrismaClient();
async function generateCustomReport(config) {
    try {
        const { metrics, filters, groupBy, timeRange, format = 'json' } = config;
        const data = {};
        await Promise.all(metrics.map(async (metric) => {
            data[metric] = await fetchMetricData(metric, filters, groupBy, timeRange);
        }));
        if (format === 'csv') {
            const parser = new json2csv_1.Parser();
            return parser.parse(flattenData(data));
        }
        return data;
    }
    catch (error) {
        logger_1.default.error('Error generating custom report:', error);
        throw (0, errorHandler_1.createAppError)('Failed to generate report', 500);
    }
}
async function analyzeTrends(metric, period, timeRange) {
    const { start, end } = timeRange;
    switch (metric) {
        case 'user_growth':
            return getUserGrowthTrend(period, start, end);
        case 'content_engagement':
            return getContentEngagementTrend(period, start, end);
        case 'platform_usage':
            return getPlatformUsageTrend(period, start, end);
        default:
            throw (0, errorHandler_1.createAppError)('Invalid metric for trend analysis', 400);
    }
}
async function getPerformanceReport(timeRange) {
    const { start, end } = timeRange;
    const [apiPerformance, errorRates, resourceUsage, responseTimeDistribution] = await Promise.all([
        getApiPerformanceMetrics(start, end),
        getErrorRateMetrics(start, end),
        getResourceUsageMetrics(start, end),
        getResponseTimeDistribution(start, end),
    ]);
    return {
        apiPerformance,
        errorRates,
        resourceUsage,
        responseTimeDistribution,
    };
}
// Helper functions
async function fetchMetricData(metric, filters, groupBy, timeRange) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where = { ...filters };
    if (timeRange) {
        where.created_at = {
            gte: timeRange.start,
            lte: timeRange.end,
        };
    }
    switch (metric) {
        case 'user_count':
            return prisma.user.groupBy({
                by: groupBy || [],
                where,
                _count: true,
            });
        case 'content_metrics':
            return prisma.article.groupBy({
                by: groupBy || [],
                where,
                _count: true,
            });
        // Add more metric cases as needed
        default:
            throw (0, errorHandler_1.createAppError)(`Unsupported metric: ${metric}`, 400);
    }
}
function flattenData(data) {
    const flattened = [];
    Object.entries(data).forEach(([metric, values]) => {
        if (Array.isArray(values)) {
            values.forEach((value) => {
                flattened.push({ metric, ...value });
            });
        }
        else {
            flattened.push({ metric, value: values });
        }
    });
    return flattened;
}
async function getUserGrowthTrend(period, start, end) {
    const users = await prisma.user.groupBy({
        by: ['created_at'],
        where: {
            created_at: {
                gte: start,
                lte: end,
            },
        },
        _count: true,
    });
    return aggregateByPeriod(users, period, 'created_at', '_count');
}
async function getContentEngagementTrend(period, start, end) {
    const engagementData = await prisma.dailyTopic.groupBy({
        by: ['date'],
        where: {
            date: { gte: start, lte: end },
        },
        _count: {
            _all: true,
        },
    });
    return engagementData.map((item) => ({
        period: formatPeriod(item.date, period),
        value: item._count?._all ?? 0,
    }));
}
async function getPlatformUsageTrend(period, start, end) {
    const usageData = await prisma.userActivityLog.groupBy({
        by: ['timestamp'],
        where: {
            timestamp: { gte: start, lte: end },
            action: { in: ['LOGIN', 'CONTENT_VIEW', 'API_CALL'] },
        },
        _count: true,
    });
    return aggregateByPeriod(usageData, period, 'timestamp', '_count');
}
function aggregateByPeriod(data, period, dateField, valueField) {
    return data.reduce((acc, item) => {
        const periodKey = formatPeriod(new Date(item[dateField]), period);
        const existing = acc.find((x) => x.period === periodKey);
        const value = Number(item[valueField]) || 0;
        if (existing) {
            existing.value += value;
        }
        else {
            acc.push({ period: periodKey, value });
        }
        return acc;
    }, []);
}
function formatPeriod(date, period) {
    const d = new Date(date);
    switch (period) {
        case 'daily':
            return d.toISOString().split('T')[0];
        case 'weekly':
            return `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
        case 'monthly':
            return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        default:
            throw (0, errorHandler_1.createAppError)(`Unsupported period: ${period}`, 400);
    }
}
// Analytics helper methods
async function getPageViewAnalytics(start, end) {
    return prisma.dailyTopicView.aggregate({
        _sum: { viewCount: true },
        where: { created_at: { gte: start, lte: end } },
    });
}
async function getFeatureUsageAnalytics(start, end) {
    return prisma.userActivityLog.groupBy({
        by: ['action'],
        _count: true,
        where: { timestamp: { gte: start, lte: end } },
    });
}
async function getSessionAnalytics(start, end) {
    return prisma.accessLog.aggregate({
        _avg: { duration: true },
        _max: { duration: true },
        _min: { duration: true },
        where: { created_at: { gte: start, lte: end } },
    });
}
async function getUserPathAnalytics(start, end) {
    return prisma.accessLog.groupBy({
        by: ['route'],
        _count: true,
        where: { created_at: { gte: start, lte: end } },
    });
}
async function getApiPerformanceMetrics(start, end) {
    return prisma.accessLog.aggregate({
        _avg: { duration: true, statusCode: true },
        where: { created_at: { gte: start, lte: end } },
    });
}
async function getErrorRateMetrics(start, end) {
    return prisma.accessLog.groupBy({
        by: ['statusCode'],
        _count: true,
        where: {
            created_at: { gte: start, lte: end },
            statusCode: { gte: 400 },
        },
    });
}
async function getResourceUsageMetrics(start, end) {
    const [downloadStats, ratingStats, difficultyStats] = await Promise.all([
        prisma.resource.aggregate({
            _sum: { downloadCount: true },
            where: { created_at: { gte: start, lte: end } },
        }),
        prisma.resource.aggregate({
            _avg: { rating: true },
            where: { created_at: { gte: start, lte: end } },
        }),
        prisma.resource.groupBy({
            by: ['difficulty'],
            _count: { _all: true },
            where: { created_at: { gte: start, lte: end } },
        }),
    ]);
    return {
        totalDownloads: downloadStats._sum.downloadCount ?? 0,
        averageRating: ratingStats._avg.rating || 0,
        countsByDifficulty: difficultyStats.reduce((acc, { difficulty, _count }) => ({
            ...acc,
            [difficulty]: _count._all,
        }), {}),
    };
}
async function getResponseTimeDistribution(start, end) {
    const distribution = await prisma.$queryRaw `
    SELECT 
      CASE
        WHEN duration < 100 THEN '0-100ms'
        WHEN duration BETWEEN 100 AND 500 THEN '100-500ms'
        WHEN duration BETWEEN 500 AND 1000 THEN '500ms-1s'
        WHEN duration BETWEEN 1000 AND 3000 THEN '1-3s'
        ELSE '3s+'
      END as range,
      COUNT(*) as count
    FROM "AccessLog"
    WHERE created_at BETWEEN ${start} AND ${end}
    GROUP BY range
    ORDER BY MIN(duration)
  `;
    return distribution.map((item) => ({
        range: item.range,
        count: Number(item.count),
    }));
}
//# sourceMappingURL=adminReportingService.js.map