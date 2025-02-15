"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardMetrics = getDashboardMetrics;
exports.searchUsers = searchUsers;
exports.updateUserRole = updateUserRole;
exports.getSystemAuditLogs = getSystemAuditLogs;
exports.getContentModerationQueue = getContentModerationQueue;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const cacheService_1 = require("./cacheService");
const prisma = new client_1.PrismaClient();
async function getDashboardMetrics() {
    try {
        const cachedMetrics = await (0, cacheService_1.getCache)('admin:dashboard:metrics');
        if (cachedMetrics)
            return cachedMetrics;
        const [userStats, platformMetrics, activityMetrics, systemHealth] = await Promise.all([
            getUserStats(),
            getPlatformMetrics(),
            getActivityMetrics(),
            getSystemHealth(),
        ]);
        const metrics = {
            userStats,
            platformMetrics,
            activityMetrics,
            systemHealth,
        };
        await (0, cacheService_1.setCache)('admin:dashboard:metrics', metrics, { ttl: 300 });
        return metrics;
    }
    catch (error) {
        logger_1.default.error('Error fetching dashboard metrics:', error);
        throw (0, errorHandler_1.createAppError)('Failed to fetch dashboard metrics', 500);
    }
}
async function getUserStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    const [totalUsers, newUsers, usersByRole, activeUsers] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { created_at: { gte: thirtyDaysAgo } } }),
        prisma.user.groupBy({ by: ['role_id'], _count: true }),
        prisma.userProgress.groupBy({
            by: ['user_id'],
            having: { user_id: { _count: { gt: 0 } } },
        }),
    ]);
    const completionRates = await prisma.userProgress.groupBy({
        by: ['is_completed'],
        _count: true,
    });
    return {
        totalUsers,
        activeUsers: activeUsers.length,
        newUsers,
        usersByRole: usersByRole.reduce((acc, curr) => ({
            ...acc,
            [curr.role_id ?? 'none']: curr._count,
        }), {}),
        completionRates: completionRates.reduce((acc, curr) => ({
            ...acc,
            [curr.is_completed ? 'completed' : 'inProgress']: curr._count,
        }), { completed: 0, inProgress: 0 }),
    };
}
async function getPlatformMetrics() {
    const [roadmaps, challenges, articles, quizzes, engagements] = await Promise.all([
        prisma.roadmap.count(),
        prisma.challenge.count(),
        prisma.article.count(),
        prisma.quiz.count(),
        prisma.userProgress.count({ where: { is_completed: true } }),
    ]);
    const totalContent = roadmaps + challenges + articles + quizzes;
    const engagementRate = totalContent ? (engagements / totalContent) * 100 : 0;
    return {
        totalRoadmaps: roadmaps,
        totalChallenges: challenges,
        totalArticles: articles,
        totalQuizzes: quizzes,
        engagementRate,
    };
}
async function getActivityMetrics() {
    const [dailyUsers, weeklyUsers, monthlyUsers, popularContent] = await Promise.all([
        prisma.user.count({
            where: { updated_at: { gte: new Date(Date.now() - 86400000) } },
        }),
        prisma.user.count({
            where: { updated_at: { gte: new Date(Date.now() - 604800000) } },
        }),
        prisma.user.count({
            where: { updated_at: { gte: new Date(Date.now() - 2592000000) } },
        }),
        getPopularContent(),
    ]);
    return {
        dailyActiveUsers: dailyUsers,
        weeklyActiveUsers: weeklyUsers,
        monthlyActiveUsers: monthlyUsers,
        popularContent,
    };
}
async function getPopularContent() {
    const [roadmaps, challenges, articles] = await Promise.all([
        prisma.roadmap.findMany({
            take: 5,
            orderBy: { user_roadmaps: { _count: 'desc' } },
            select: {
                id: true,
                title: true,
                _count: { select: { user_roadmaps: true } },
            },
        }),
        prisma.challenge.findMany({
            take: 5,
            orderBy: { submissions: { _count: 'desc' } },
            select: {
                id: true,
                title: true,
                _count: { select: { submissions: true } },
            },
        }),
        prisma.article.findMany({
            take: 5,
            where: { status: client_1.Status.APPROVED },
            orderBy: { versions: { _count: 'desc' } },
            select: { id: true, title: true, _count: { select: { versions: true } } },
        }),
    ]);
    return [
        ...roadmaps.map((r) => ({
            id: r.id,
            type: 'roadmap',
            title: r.title,
            views: r._count.user_roadmaps,
        })),
        ...challenges.map((c) => ({
            id: c.id,
            type: 'challenge',
            title: c.title,
            views: c._count.submissions,
        })),
        ...articles.map((a) => ({
            id: a.id,
            type: 'article',
            title: a.title,
            views: a._count.versions,
        })),
    ].sort((a, b) => b.views - a.views);
}
async function getSystemHealth() {
    try {
        const startTime = process.hrtime();
        await prisma.$queryRaw `SELECT 1`;
        const [seconds, nanoseconds] = process.hrtime(startTime);
        return {
            serverStatus: 'running',
            databaseStatus: 'healthy',
            cacheStatus: (await (0, cacheService_1.getCache)('health:check')) ? 'healthy' : 'unhealthy',
            averageResponseTime: seconds * 1000 + nanoseconds / 1000000,
            errorRate: await calculateErrorRate(),
            resourceUsage: {
                cpu: process.cpuUsage().user / 1000000,
                memory: process.memoryUsage().heapUsed / 1024 / 1024,
                disk: 0,
            },
        };
    }
    catch (error) {
        logger_1.default.error('Error checking system health:', error);
        throw (0, errorHandler_1.createAppError)('System health check failed', 500);
    }
}
async function calculateErrorRate() {
    const twentyFourHoursAgo = new Date(Date.now() - 86400000);
    const [totalRequests, errorCount] = await Promise.all([
        prisma.userProgress.count({
            where: { updated_at: { gte: twentyFourHoursAgo } },
        }),
        prisma.errorLog.count({
            where: {
                timestamp: { gte: twentyFourHoursAgo },
                service: 'USER_PROGRESS',
            },
        }),
    ]);
    // Avoid division by zero and limit to 2 decimal places
    return totalRequests > 0
        ? Number(((errorCount / totalRequests) * 100).toFixed(2))
        : 0;
}
async function searchUsers(query) {
    try {
        const { email, role_id, page = 1, limit = 10, sortBy = 'created_at', } = query;
        return await prisma.user.findMany({
            where: {
                email: email ? { contains: String(email) } : undefined,
                role_id: role_id ? String(role_id) : undefined,
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { [String(sortBy)]: 'desc' },
            select: {
                id: true,
                supabase_id: true,
                email: true,
                username: true,
                full_name: true,
                avatar_url: true,
                bio: true,
                address: true,
                github_url: true,
                linkedin_url: true,
                twitter_url: true,
                website_url: true,
                role_id: true,
                created_at: true,
                updated_at: true,
                is_active: true,
                timezone: true,
                is_verified: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        created_at: true,
                        updated_at: true,
                        parent_id: true,
                    },
                },
            },
        });
    }
    catch (error) {
        logger_1.default.error('Error searching users:', error);
        throw (0, errorHandler_1.createAppError)('Failed to search users', 500);
    }
}
async function updateUserRole(user_id, role_id) {
    try {
        const [user, role] = await Promise.all([
            prisma.user.findUnique({ where: { id: user_id } }),
            prisma.role.findUnique({ where: { id: role_id } }),
        ]);
        if (!user)
            throw (0, errorHandler_1.createAppError)('User not found', 404);
        if (!role)
            throw (0, errorHandler_1.createAppError)('Role not found', 404);
        return await prisma.user.update({
            where: { id: user_id },
            data: { role_id },
            include: { role: true },
        });
    }
    catch (error) {
        logger_1.default.error('Error updating user role:', error);
        throw (0, errorHandler_1.createAppError)('Failed to update user role', 500);
    }
}
async function getSystemAuditLogs() {
    try {
        return await prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching audit logs:', error);
        throw (0, errorHandler_1.createAppError)('Failed to fetch audit logs', 500);
    }
}
async function getContentModerationQueue() {
    try {
        return await prisma.content.findMany({
            where: {
                status: 'PENDING_REVIEW',
            },
            include: {
                author: {
                    select: {
                        id: true,
                        full_name: true,
                    },
                },
            },
            orderBy: {
                created_at: 'asc',
            },
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching moderation queue:', error);
        throw (0, errorHandler_1.createAppError)('Failed to fetch moderation queue', 500);
    }
}
//# sourceMappingURL=adminDashboardService.js.map