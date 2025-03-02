"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArticleByTopicId = exports.submitQuiz = exports.getQuizByTopicId = exports.getArticlesForTopic = exports.getUnpublishedTopics = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const index_1 = require("../utils/index");
const apiResponse_1 = require("../utils/apiResponse");
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
    return (0, apiResponse_1.sendResponse)(res, 'TOPICS_FETCHED', { data: topics });
});
exports.getArticlesForTopic = (0, index_1.catchAsync)(async (req, res) => {
    const { topicId } = req.params;
    const topic = await prisma_1.default.topic.findUnique({
        where: {
            id: String(topicId),
        },
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
    if (!topic) {
        return (0, apiResponse_1.sendResponse)(res, 'TOPIC_NOT_FOUND');
    }
    return (0, apiResponse_1.sendResponse)(res, 'ARTICLES_FETCHED', { data: topic.articles });
});
exports.getQuizByTopicId = (0, index_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const quiz = await prisma_1.default.quiz.findFirst({
        where: { topic_id: id },
        include: {
            questions: {
                include: {
                    options: {
                        orderBy: {
                            created_at: 'asc',
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
        return (0, apiResponse_1.sendResponse)(res, 'QUIZ_NOT_FOUND');
    }
    return (0, apiResponse_1.sendResponse)(res, 'QUIZ_FETCHED', { data: quiz });
});
exports.submitQuiz = (0, index_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const { topic_id, answers } = req.body;
    const quiz = await prisma_1.default.quiz.findFirst({
        where: { topic_id },
        include: { questions: true },
    });
    if (!quiz) {
        return (0, apiResponse_1.sendResponse)(res, 'QUIZ_NOT_FOUND');
    }
    let score = 0;
    quiz.questions.forEach((question, index) => {
        if (question.correct_answer === answers[index]) {
            score += 1;
        }
    });
    const passing_score = quiz.passing_score || Math.ceil(quiz.questions.length * 0.7);
    const is_passed = score >= passing_score;
    if (is_passed) {
        await prisma_1.default.userProgress.update({
            where: {
                user_id_topic_id: {
                    user_id: userId,
                    topic_id: topic_id,
                },
            },
            data: { is_completed: true },
        });
    }
    return (0, apiResponse_1.sendResponse)(res, is_passed ? 'QUIZ_PASSED' : 'QUIZ_FAILED', {
        data: { score, is_passed },
    });
});
exports.getArticleByTopicId = (0, index_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const article = await prisma_1.default.article.findFirst({
        where: {
            topic_id: id,
            status: 'APPROVED',
        },
    });
    if (!article) {
        return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND');
    }
    return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_FETCHED', { data: article });
});
//# sourceMappingURL=topicController.js.map