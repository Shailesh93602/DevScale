"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLearningPath = exports.resetProgress = exports.getUserProgress = exports.trackProgress = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const cacheService_1 = require("./cacheService");
const prisma = new client_1.PrismaClient();
const trackProgress = async (data) => {
    try {
        const existing = await prisma.userProgress.findFirst({
            where: { user_id: data.user_id, topic_id: data.topic_id },
        });
        const progress = await prisma.userProgress.upsert({
            where: { id: existing?.id ?? '' },
            create: {
                user_id: data.user_id,
                topic_id: data.topic_id,
                subject_id: data.subject_id,
                progress_percentage: data.progress_percentage,
                is_completed: data.is_completed,
                completed_at: data.is_completed ? new Date() : null,
            },
            update: {
                progress_percentage: data.progress_percentage,
                is_completed: data.is_completed,
                completed_at: data.is_completed ? new Date() : null,
            },
        });
        await (0, cacheService_1.deleteCache)(`user:${data.user_id}:progress`);
        return progress;
    }
    catch (error) {
        throw (0, errorHandler_1.createAppError)('Failed to track progress', 500, error);
    }
};
exports.trackProgress = trackProgress;
const getUserProgress = async (user_id) => {
    const cached = await (0, cacheService_1.getCache)(`user:${user_id}:progress`);
    if (cached)
        return cached;
    const progress = await prisma.userProgress.findMany({
        where: { user_id },
        include: { topic: true },
        orderBy: { completed_at: 'desc' },
    });
    await (0, cacheService_1.setCache)(`user:${user_id}:progress`, progress, { ttl: 3600 });
    return progress;
};
exports.getUserProgress = getUserProgress;
const resetProgress = async (user_id, topic_id) => {
    await prisma.userProgress.deleteMany({
        where: { user_id, topic_id },
    });
    await (0, cacheService_1.deleteCache)(`user:${user_id}:progress`);
};
exports.resetProgress = resetProgress;
const calculateLearningPath = async (user_id) => {
    const cacheKey = `user:${user_id}:learning-path`;
    const cached = await (0, cacheService_1.getCache)(cacheKey);
    if (cached)
        return cached;
    const progress = await prisma.userProgress.findMany({
        where: { user_id },
        include: { topic: true },
    });
    const completed = progress.filter((p) => p.is_completed);
    const recommendations = await prisma.topic.findMany({
        where: {
            OR: [
                { prerequisites: { isEmpty: true } },
                {
                    prerequisites: {
                        hasEvery: completed
                            .map((c) => c.topic_id)
                            .filter((id) => id !== null),
                    },
                },
            ],
            NOT: {
                id: {
                    in: completed
                        .map((c) => c.topic_id)
                        .filter((id) => id !== null),
                },
            },
        },
        orderBy: { order: 'asc' },
    });
    await (0, cacheService_1.setCache)(cacheKey, recommendations, { ttl: 3600 });
    return recommendations;
};
exports.calculateLearningPath = calculateLearningPath;
//# sourceMappingURL=progressTrackingService.js.map