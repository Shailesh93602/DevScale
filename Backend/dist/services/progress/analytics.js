"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProgress = getUserProgress;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../../utils/logger"));
const prisma = new client_1.PrismaClient();
async function getUserProgress(userId) {
    try {
        const [totalTopics, completedTopics, recentActivity] = await Promise.all([
            prisma.topic.count(),
            prisma.progress.count({
                where: { userId, status: client_1.Status.APPROVED },
            }),
            getUserRecentActivity(userId),
        ]);
        logger_1.default.info('Retrieved user progress', {
            userId,
            completedTopics,
            totalTopics,
        });
        return {
            totalTopics,
            completedTopics,
            progressPercentage: totalTopics
                ? (completedTopics / totalTopics) * 100
                : 0,
            recentActivity,
        };
    }
    catch (error) {
        logger_1.default.error('Error getting user progress:', error);
        throw error;
    }
}
async function getUserRecentActivity(userId) {
    const [topicProgress, quizSubmissions, challengeSubmissions] = await Promise.all([
        prisma.progress.findMany({
            where: { userId, status: client_1.Status.APPROVED },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            include: { topic: true, roadmap: true },
        }),
        prisma.quizSubmission.findMany({
            where: { userId, isPassed: true },
            orderBy: { created_at: 'desc' },
            take: 10,
            include: { quiz: true },
        }),
        prisma.challengeSubmission.findMany({
            where: { userId, status: client_1.SubmissionStatus.accepted },
            orderBy: { created_at: 'desc' },
            take: 10,
            include: { challenge: true },
        }),
    ]);
    const activity = [
        ...topicProgress.map((p) => ({
            type: 'topic_completed',
            entityId: p.topicId,
            timestamp: p.updatedAt,
            details: {
                topicTitle: p.topic.title,
                roadmapTitle: p.roadmap.title,
            },
        })),
        ...quizSubmissions.map((q) => ({
            type: 'quiz_completed',
            entityId: q.quizId,
            timestamp: q.created_at,
            details: {
                quizTitle: q.quiz.title,
                score: q.score,
            },
        })),
        ...challengeSubmissions.map((c) => ({
            type: 'challenge_completed',
            entityId: c.challengeId,
            timestamp: c.created_at,
            details: {
                challengeTitle: c.challenge.title,
            },
        })),
    ];
    return activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
//# sourceMappingURL=analytics.js.map