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
            where: { userId: data.userId, topicId: data.topicId },
        });
        const progress = await prisma.userProgress.upsert({
            where: { id: existing?.id ?? '' },
            create: {
                userId: data.userId,
                topicId: data.topicId,
                subjectId: data.subjectId,
                progressPercentage: data.progressPercentage,
                isCompleted: data.isCompleted,
                completedAt: data.isCompleted ? new Date() : null,
            },
            update: {
                progressPercentage: data.progressPercentage,
                isCompleted: data.isCompleted,
                completedAt: data.isCompleted ? new Date() : null,
            },
        });
        await (0, cacheService_1.deleteCache)(`user:${data.userId}:progress`);
        return progress;
    }
    catch (error) {
        throw (0, errorHandler_1.createAppError)('Failed to track progress', 500, error);
    }
};
exports.trackProgress = trackProgress;
const getUserProgress = async (userId) => {
    const cached = await (0, cacheService_1.getCache)(`user:${userId}:progress`);
    if (cached)
        return cached;
    const progress = await prisma.userProgress.findMany({
        where: { userId },
        include: { topic: true },
        orderBy: { completedAt: 'desc' },
    });
    await (0, cacheService_1.setCache)(`user:${userId}:progress`, progress, { ttl: 3600 });
    return progress;
};
exports.getUserProgress = getUserProgress;
const resetProgress = async (userId, topicId) => {
    await prisma.userProgress.deleteMany({
        where: { userId, topicId },
    });
    await (0, cacheService_1.deleteCache)(`user:${userId}:progress`);
};
exports.resetProgress = resetProgress;
const calculateLearningPath = async (userId) => {
    const cacheKey = `user:${userId}:learning-path`;
    const cached = await (0, cacheService_1.getCache)(cacheKey);
    if (cached)
        return cached;
    const progress = await prisma.userProgress.findMany({
        where: { userId },
        include: { topic: true },
    });
    const completed = progress.filter((p) => p.isCompleted);
    const recommendations = await prisma.topic.findMany({
        where: {
            OR: [
                { prerequisites: { isEmpty: true } },
                {
                    prerequisites: {
                        hasEvery: completed
                            .map((c) => c.topicId)
                            .filter((id) => id !== null),
                    },
                },
            ],
            NOT: {
                id: {
                    in: completed
                        .map((c) => c.topicId)
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