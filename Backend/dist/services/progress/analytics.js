"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProgress = getUserProgress;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../../utils/logger"));
const prisma = new client_1.PrismaClient();
async function getUserProgress(user_id) {
    try {
        const [total_topics, completed_topics, recent_activity] = await Promise.all([
            prisma.topic.count(),
            prisma.progress.count({
                where: { user_id: user_id, status: client_1.Status.APPROVED },
            }),
            getUserRecentActivity(user_id),
        ]);
        logger_1.default.info('Retrieved user progress', {
            user_id,
            completed_topics,
            total_topics,
        });
        return {
            total_topics,
            completed_topics,
            progress_percentage: total_topics
                ? (completed_topics / total_topics) * 100
                : 0,
            recent_activity,
        };
    }
    catch (error) {
        logger_1.default.error('Error getting user progress:', error);
        throw error;
    }
}
async function getUserRecentActivity(user_id) {
    const [topic_progress, quiz_submissions, challenge_submissions] = await Promise.all([
        prisma.progress.findMany({
            where: { user_id: user_id, status: client_1.Status.APPROVED },
            orderBy: { updated_at: 'desc' },
            take: 10,
            include: { topic: true, roadmap: true },
        }),
        prisma.quizSubmission.findMany({
            where: { user_id: user_id, is_passed: true },
            orderBy: { created_at: 'desc' },
            take: 10,
            include: { quiz: true },
        }),
        prisma.challengeSubmission.findMany({
            where: { user_id: user_id, status: client_1.SubmissionStatus.accepted },
            orderBy: { created_at: 'desc' },
            take: 10,
            include: { challenge: true },
        }),
    ]);
    const activity = [
        ...topic_progress.map((p) => ({
            type: 'topic_completed',
            entity_id: p.topic_id,
            timestamp: p.updated_at,
            details: {
                topic_title: p.topic.title,
                roadmap_title: p.roadmap.title,
            },
        })),
        ...quiz_submissions.map((q) => ({
            type: 'quiz_completed',
            entity_id: q.quiz_id,
            timestamp: q.created_at,
            details: {
                quiz_title: q.quiz.title,
                score: q.score,
            },
        })),
        ...challenge_submissions.map((c) => ({
            type: 'challenge_completed',
            entity_id: c.challenge_id,
            timestamp: c.created_at,
            details: {
                challenge_title: c.challenge.title,
            },
        })),
    ];
    return activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
//# sourceMappingURL=analytics.js.map