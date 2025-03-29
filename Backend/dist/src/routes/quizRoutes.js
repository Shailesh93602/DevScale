"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizRouter = void 0;
const BaseRouter_1 = require("./BaseRouter");
const quizController_1 = __importDefault(require("../controllers/quizController"));
class QuizRouter extends BaseRouter_1.BaseRouter {
    quizController;
    constructor() {
        super();
        this.quizController = new quizController_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/create', this.quizController.createQuiz);
        this.router.post('/submit', this.quizController.submitQuiz);
    }
}
exports.QuizRouter = QuizRouter;
exports.default = new QuizRouter().getRouter();
//# sourceMappingURL=quizRoutes.js.map