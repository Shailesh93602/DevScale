"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = searchUsers;
exports.updateUserRole = updateUserRole;
exports.updateUserStatus = updateUserStatus;
exports.getUserActivityLogs = getUserActivityLogs;
exports.bulkUpdateUsers = bulkUpdateUsers;
exports.getUserStats = getUserStats;
const client_1 = require("@prisma/client");
const rbacService_1 = require("./rbacService");
const prisma = new client_1.PrismaClient();
async function searchUsers(params) {
    const { query, role, status, dateRange, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', } = params;
    const where = {};
    // Search by query across multiple fields
    if (query) {
        where.OR = [
            { username: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { full_name: { contains: query, mode: 'insensitive' } },
        ];
    }
    // Filter by role
    if (role) {
        where.roleId = role;
    }
    // Filter by status (if you have a status field)
    if (status) {
        where.status = status;
    }
    // Filter by date range
    if (dateRange) {
        where.created_at = {
            gte: dateRange.start,
            lte: dateRange.end,
        };
    }
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                role: true,
                userPoints: true,
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.user.count({ where }),
    ]);
    return {
        users,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            page,
            limit,
        },
    };
}
async function updateUserRole(userId, roleId) {
    const user = await (0, rbacService_1.assignRoleToUser)(userId, roleId);
    await logUserActivity(userId, 'ROLE_UPDATE', { roleId });
    return user;
}
async function updateUserStatus(userId, status, reason) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            status,
        },
    });
    await logUserActivity(userId, 'STATUS_UPDATE', { status, reason });
    return user;
}
async function getUserActivityLogs(userId, page = 1, limit = 10) {
    const [logs, total] = await Promise.all([
        prisma.userActivityLog.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.userActivityLog.count({ where: { userId } }),
    ]);
    return {
        logs,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            page,
            limit,
        },
    };
}
async function bulkUpdateUsers(userIds, action, params) {
    const transaction = [];
    for (const userId of userIds) {
        switch (action) {
            case 'suspend':
                transaction.push(prisma.user.update({
                    where: { id: userId },
                    data: { status: 'suspended' },
                }));
                break;
            case 'activate':
                transaction.push(prisma.user.update({
                    where: { id: userId },
                    data: { status: 'active' },
                }));
                break;
            case 'delete':
                transaction.push(prisma.user.delete({
                    where: { id: userId },
                }));
                break;
            case 'changeRole':
                if (params?.roleId) {
                    transaction.push(prisma.user.update({
                        where: { id: userId },
                        data: { roleId: params.roleId },
                    }));
                }
                break;
        }
        // Log the activity
        transaction.push(prisma.userActivityLog.create({
            data: {
                userId,
                action: `BULK_${action.toUpperCase()}`,
                details: params,
                timestamp: new Date(),
            },
        }));
    }
    await prisma.$transaction(transaction);
}
async function logUserActivity(userId, action, details) {
    await prisma.userActivityLog.create({
        data: {
            userId,
            action,
            details,
            timestamp: new Date(),
        },
    });
}
async function getUserStats(userId) {
    const [totalPosts, totalComments, totalChallenges, totalArticles, userPoints,] = await Promise.all([
        prisma.forumPost.count({ where: { userId } }),
        prisma.forumComment.count({ where: { userId } }),
        prisma.challengeSubmission.count({ where: { userId } }),
        prisma.article.count({ where: { authorId: userId } }),
        prisma.userPoints.findUnique({ where: { userId } }),
    ]);
    return {
        totalPosts,
        totalComments,
        totalChallenges,
        totalArticles,
        points: userPoints?.points ?? 0,
    };
}
//# sourceMappingURL=adminUserManagementService.js.map