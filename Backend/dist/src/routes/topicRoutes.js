"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const topicController_1 = __importDefault(require("@/controllers/topicController"));
class TopicRoutes extends BaseRouter_1.BaseRouter {
    topicController;
    constructor() {
        super();
        this.topicController = new topicController_1.default();
        this.router.use(authMiddleware_1.authMiddleware);
    }
    initializeRoutes() {
        this.router.get('/:id/articles', this.topicController.getArticlesForTopic);
        this.router.get('/:id/article', this.topicController.getArticlesForTopic);
        this.router.get('/:id/quiz', this.topicController.getQuizByTopicId);
        this.router.post('/quiz/submit', this.topicController.submitQuiz);
        this.router.get('/unpublished', this.topicController.getUnpublishedTopics);
    }
}
exports.TopicRoutes = TopicRoutes;
//# sourceMappingURL=topicRoutes.js.map