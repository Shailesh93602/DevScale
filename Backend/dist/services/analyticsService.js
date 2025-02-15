"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = exports.trackUserActivity = exports.getPlatformAnalytics = exports.getUserAnalytics = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
const getUserAnalytics = async (user_id) => {
    if (!user_id) {
        throw (0, errorHandler_1.createAppError)('Invalid user ID format', 400);
    }
    const [progress, submissions, engagementData] = await Promise.all([
        prisma.userProgress.findMany({ where: { user_id } }),
        prisma.challengeSubmission.findMany({ where: { user_id } }),
        Promise.all([
            prisma.article.count({ where: { author_id: user_id } }),
            prisma.forumPost.count({ where: { user_id } }),
            prisma.studyGroupMember.count({ where: { user_id } }),
            prisma.user.findUnique({
                where: { id: user_id },
                select: { updated_at: true },
            }),
        ]),
    ]);
    const completedTopics = progress.filter((p) => p.is_completed).length;
    const totalTopics = progress.length;
    const successfulSubmissions = submissions.filter((s) => s.status === 'accepted').length;
    return {
        progress: {
            completedTopics,
            inProgressTopics: totalTopics - completedTopics,
            completionRate: totalTopics ? completedTopics / totalTopics : 0,
        },
        performance: {
            averageScore: submissions.reduce((acc, s) => acc + (s.score || 0), 0) /
                (submissions.length || 1),
            challengesSolved: successfulSubmissions,
            successRate: submissions.length
                ? successfulSubmissions / submissions.length
                : 0,
        },
        engagement: {
            articleCount: engagementData[0],
            forumPosts: engagementData[1],
            studyGroupCount: engagementData[2],
            lastActive: engagementData[3]?.updated_at || new Date(),
        },
    };
};
exports.getUserAnalytics = getUserAnalytics;
const getPlatformAnalytics = async (startDate, endDate) => {
    const dateFilter = {
        created_at: { gte: startDate, lte: endDate },
    };
    const [userStats, contentStats, popularTopics, errorStats] = await Promise.all([
        getUserStats(dateFilter),
        getContentStats(),
        getPopularTopics(),
        getErrorStats(startDate, endDate),
    ]);
    return {
        userStats,
        contentStats,
        engagementStats: {
            averageTimeSpent: await calculateAverageTimeSpent(),
            completionRates: await calculateCompletionRates(),
            popularTopics: popularTopics.map((t) => ({
                topic: t.title,
                count: t._count.user_progress,
            })),
        },
        errorStats,
    };
};
exports.getPlatformAnalytics = getPlatformAnalytics;
const calculateAverageTimeSpent = async () => {
    const sessions = await prisma.userSession.findMany({
        where: {
            end_time: { not: null },
        },
        select: {
            start_time: true,
            end_time: true,
        },
    });
    if (sessions.length === 0)
        return 0;
    const totalDuration = sessions.reduce((acc, session) => {
        const duration = session.end_time.getTime() - session.start_time.getTime();
        return acc + duration;
    }, 0);
    return totalDuration / sessions.length / 1000; // Return in seconds
};
const calculateCompletionRates = async () => {
    const topics = await prisma.topic.findMany({
        include: {
            _count: {
                select: {
                    user_progress: true,
                },
            },
            user_progress: {
                where: {
                    is_completed: true,
                },
            },
        },
    });
    return topics.reduce((acc, topic) => ({
        ...acc,
        [topic.title]: topic._count.user_progress > 0
            ? topic.user_progress.length / topic._count.user_progress
            : 0,
    }), {});
};
const getErrorStats = async (startDate, endDate) => {
    const whereClause = {
        timestamp: {
            gte: startDate,
            lte: endDate,
        },
        activity: {
            contains: 'error',
            mode: 'insensitive',
        },
    };
    const [totalErrors, criticalErrors, errorTypes] = await Promise.all([
        prisma.activityLog.count({
            where: whereClause,
        }),
        prisma.activityLog.count({
            where: {
                ...whereClause,
                metadata: {
                    path: ['severity'],
                    equals: 'CRITICAL',
                },
            },
        }),
        prisma.activityLog.groupBy({
            by: ['activity'],
            where: whereClause,
            _count: {
                activity: true,
            },
        }),
    ]);
    const total = totalErrors || 1; // Prevent division by zero
    const errorRates = errorTypes.reduce((acc, { activity, _count }) => ({
        ...acc,
        [activity]: _count.activity / total,
    }), {});
    return {
        totalErrors,
        criticalErrors,
        errorRates,
    };
};
const TRACKING_LIMIT = 100;
const trackUserActivity = async (user_id, activity, metadata) => {
    try {
        // Check rate limit
        const recentActivities = await prisma.activityLog.count({
            where: {
                user_id,
                timestamp: {
                    gte: new Date(Date.now() - 60 * 1000), // Last minute
                },
            },
        });
        if (recentActivities >= TRACKING_LIMIT) {
            logger_1.default.warn(`Activity tracking limit reached for user ${user_id}`);
            return;
        }
        await prisma.activityLog.create({
            data: {
                user_id,
                activity,
                metadata: metadata ?? client_1.Prisma.DbNull,
                timestamp: new Date(),
                device_type: 'WEB',
            },
        });
    }
    catch (error) {
        logger_1.default.error('Error tracking user activity:', error);
        throw error;
    }
};
exports.trackUserActivity = trackUserActivity;
const generateReport = async (type, id, dateRange) => {
    try {
        if (type === 'user') {
            if (!id) {
                throw (0, errorHandler_1.createAppError)('Invalid user ID for report generation', 400);
            }
            return await (0, exports.getUserAnalytics)(id);
        }
        // Validate platform analytics date range
        if (dateRange?.start && dateRange?.end) {
            const diff = dateRange.end.getTime() - dateRange.start.getTime();
            const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year
            if (diff > maxRange) {
                throw (0, errorHandler_1.createAppError)('Date range exceeds maximum allowed duration', 400);
            }
        }
        return await (0, exports.getPlatformAnalytics)(dateRange?.start, dateRange?.end);
    }
    catch (error) {
        logger_1.default.error('Error generating report:', error);
        throw (0, errorHandler_1.createAppError)('Failed to generate report', 500);
    }
};
exports.generateReport = generateReport;
async function getUserStats(dateFilter) {
    const [totalUsers, newUsers, activeUsers] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
            where: dateFilter,
        }),
        prisma.user.count({
            where: {
                updated_at: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
            },
        }),
    ]);
    return {
        totalUsers,
        activeUsers,
        newUsers,
    };
}
async function getContentStats() {
    const [articles, challenges, resources] = await Promise.all([
        prisma.article.count(),
        prisma.challenge.count(),
        prisma.resource.count(),
    ]);
    return {
        totalArticles: articles,
        totalChallenges: challenges,
        totalResources: resources,
    };
}
async function getPopularTopics() {
    const popularTopics = await prisma.topic.findMany({
        select: {
            title: true,
            _count: {
                select: {
                    user_progress: true,
                },
            },
        },
        orderBy: {
            user_progress: {
                _count: 'desc',
            },
        },
        take: 10,
    });
    return popularTopics;
}
//# sourceMappingURL=analyticsService.js.map