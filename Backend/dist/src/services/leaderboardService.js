"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = getLeaderboard;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getLeaderboard(subject_id, time_range, limit) {
    const time_filter = getTimeFilter(time_range);
    return prisma.leaderboardEntry.findMany({
        where: {
            subject_id: subject_id,
            created_at: time_filter,
        },
        orderBy: [{ score: 'desc' }, { time_taken: 'asc' }],
        take: limit,
        include: {
            user: {
                select: {
                    id: true,
                    full_name: true,
                    avatar_url: true,
                },
            },
        },
    });
}
function getTimeFilter(timeRange) {
    const now = new Date();
    const filters = {
        daily: { gte: new Date(now.setDate(now.getDate() - 1)) },
        weekly: { gte: new Date(now.setDate(now.getDate() - 7)) },
        monthly: { gte: new Date(now.setMonth(now.getMonth() - 1)) },
        all: { gte: new Date(0) },
    };
    return filters[timeRange];
}
//# sourceMappingURL=leaderboardService.js.map