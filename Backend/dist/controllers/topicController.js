"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuiz = exports.getQuizByTopicId = exports.getArticlesForTopic = exports.getUnpublishedTopics = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const index_1 = require("../utils/index");
exports.getUnpublishedTopics = (0, index_1.catchAsync)(async (req, res) => {
    const topics = await prisma_1.default.topic.findMany({
        where: {
            id: {
                in: await prisma_1.default.$queryRaw `SELECT DISTINCT "Topics"."id"
                              FROM "Topics"
                              LEFT JOIN "Articles" ON "Articles"."topicId" = "Topics"."id"
                              WHERE "Articles"."status" IS NULL OR "Articles"."status" = 'rejected'`,
            },
        },
        orderBy: {
            created_at: 'asc',
        },
    });
    res.status(200).json({
        success: true,
        message: 'Unpublished topics retrieved successfully',
        topics,
    });
});
exports.getArticlesForTopic = (0, index_1.catchAsync)(async (req, res) => {
    const { topicId } = req.params;
    const topic = await prisma_1.default.topic.findUnique({
        where: { id: topicId },
        include: {
            articles: {
                where: {
                    OR: [{ status: 'APPROVED' }, { status: 'PENDING' }],
                },
                orderBy: {
                    created_at: 'desc',
                },
            },
        },
    });
    if (topic) {
        res.status(200).json(topic.articles);
    }
    else {
        res.status(404).json({ message: 'Topic not found' });
    }
});
exports.getQuizByTopicId = (0, index_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const quiz = await prisma_1.default.quiz.findFirst({
        where: { topicId: id },
        include: {
            questions: {
                include: {
                    options: {
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
                orderBy: {
                    created_at: 'asc',
                },
            },
        },
    });
    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }
    return res.status(200).json(quiz);
});
exports.submitQuiz = (0, index_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const { topicId, answers } = req.body;
    const quiz = await prisma_1.default.quiz.findFirst({
        where: { topicId },
        include: { questions: true },
    });
    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }
    let score = 0;
    quiz.questions.forEach((question, index) => {
        if (question.correctAnswer === answers[index]) {
            score += 1;
        }
    });
    const passingScore = quiz.passingScore || Math.ceil(quiz.questions.length * 0.7);
    const isPassed = score >= passingScore;
    if (isPassed) {
        await prisma_1.default.userProgress.update({
            where: {
                userId_topicId: {
                    userId: userId,
                    topicId,
                },
            },
            data: { isCompleted: true },
        });
    }
    return res.status(200).json({
        message: isPassed ? 'Quiz passed!' : 'Quiz failed',
        score,
        isPassed,
    });
});
//# sourceMappingURL=topicController.js.map