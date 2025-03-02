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
    const { query, role, status, date_range, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', } = params;
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
        where.role_id = role;
    }
    // Filter by status (if you have a status field)
    if (status) {
        where.status = status;
    }
    // Filter by date range
    if (date_range) {
        where.created_at = {
            gte: date_range.start,
            lte: date_range.end,
        };
    }
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                role: true,
                user_points: true,
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
async function updateUserRole(user_id, role_id) {
    const user = await (0, rbacService_1.assignRoleToUser)(user_id, role_id);
    await logUserActivity(user_id, 'ROLE_UPDATE', { role_id });
    return user;
}
async function updateUserStatus(user_id, status, reason) {
    const user = await prisma.user.update({
        where: { id: user_id },
        data: {
            status,
        },
    });
    await logUserActivity(user_id, 'STATUS_UPDATE', { status, reason });
    return user;
}
async function getUserActivityLogs(user_id, page = 1, limit = 10) {
    const [logs, total] = await Promise.all([
        prisma.userActivityLog.findMany({
            where: { user_id },
            orderBy: { timestamp: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.userActivityLog.count({ where: { user_id } }),
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
async function bulkUpdateUsers(user_ids, action, params) {
    const transaction = [];
    for (const user_id of user_ids) {
        switch (action) {
            case 'suspend':
                transaction.push(prisma.user.update({
                    where: { id: user_id },
                    data: { status: 'suspended' },
                }));
                break;
            case 'activate':
                transaction.push(prisma.user.update({
                    where: { id: user_id },
                    data: { status: 'active' },
                }));
                break;
            case 'delete':
                transaction.push(prisma.user.delete({
                    where: { id: user_id },
                }));
                break;
            case 'changeRole':
                if (params?.role_id) {
                    transaction.push(prisma.user.update({
                        where: { id: user_id },
                        data: { role_id: params.role_id },
                    }));
                }
                break;
        }
        // Log the activity
        transaction.push(prisma.userActivityLog.create({
            data: {
                user_id,
                action: `BULK_${action.toUpperCase()}`,
                details: params,
                timestamp: new Date(),
            },
        }));
    }
    await prisma.$transaction(transaction);
}
async function logUserActivity(user_id, action, details) {
    await prisma.userActivityLog.create({
        data: {
            user_id,
            action,
            details,
            timestamp: new Date(),
        },
    });
}
async function getUserStats(user_id) {
    const [totalPosts, totalComments, totalChallenges, totalArticles, userPoints,] = await Promise.all([
        prisma.forumPost.count({ where: { user_id: user_id } }),
        prisma.forumComment.count({ where: { user_id: user_id } }),
        prisma.challengeSubmission.count({ where: { user_id: user_id } }),
        prisma.article.count({ where: { author_id: user_id } }),
        prisma.userPoints.findUnique({ where: { user_id: user_id } }),
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