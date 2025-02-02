"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const topicController_js_1 = require("../controllers/topicController.js");
const router = express_1.default.Router();
router.get('/:id/articles', topicController_js_1.getArticlesForTopic);
router.get('/:id/quiz', topicController_js_1.getQuizByTopicId);
router.post('/quiz/submit', topicController_js_1.submitQuiz);
router.get('/unpublished', topicController_js_1.getUnpublishedTopics);
exports.default = router;
//# sourceMappingURL=topicRoutes.js.map