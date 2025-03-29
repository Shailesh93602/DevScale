"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const apiResponse_1 = require("../utils/apiResponse");
const topicRepository_1 = __importDefault(require("../repositories/topicRepository"));
class TopicController {
    topicRepo;
    constructor() {
        this.topicRepo = new topicRepository_1.default();
    }
    getUnpublishedTopics = (0, index_1.catchAsync)(async (req, res) => {
        const topics = await this.topicRepo.findMany();
        return (0, apiResponse_1.sendResponse)(res, 'TOPICS_FETCHED', { data: topics });
    });
    getArticlesForTopic = (0, index_1.catchAsync)(async (req, res) => {
        const { topicId } = req.params;
        const topic = (await this.topicRepo.findUnique({
            where: { id: topicId },
            include: { articles: true },
        }));
        if (!topic) {
            return (0, apiResponse_1.sendResponse)(res, 'TOPIC_NOT_FOUND');
        }
        return (0, apiResponse_1.sendResponse)(res, 'ARTICLES_FETCHED', { data: topic.articles });
    });
    getQuizByTopicId = (0, index_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const quiz = await this.topicRepo.findUnique({ where: { id } });
        if (!quiz) {
            return (0, apiResponse_1.sendResponse)(res, 'QUIZ_NOT_FOUND');
        }
        return (0, apiResponse_1.sendResponse)(res, 'QUIZ_FETCHED', { data: quiz });
    });
    submitQuiz = (0, index_1.catchAsync)(async (req, res) => {
        // const userId = req.user.id;
        // const { topic_id, answers } = req.body;
        // TODO: implement this function
        // const result = await this.topicRepo.submitQuiz(userId, topic_id, answers);
        return (0, apiResponse_1.sendResponse)(res, 
        // result.is_passed
        req.user.id ? 'QUIZ_PASSED' : 'QUIZ_FAILED'
        // {
        // data: result,
        // }
        );
    });
    getArticleByTopicId = (0, index_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const topic = (await this.topicRepo.findUnique({
            where: { id },
            include: { articles: true },
        }));
        if (!topic?.articles) {
            return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND');
        }
        return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_FETCHED', { data: topic.articles });
    });
}
exports.default = TopicController;
//# sourceMappingURL=topicController.js.map