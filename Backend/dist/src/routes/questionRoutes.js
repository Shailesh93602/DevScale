"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const questionControllers_1 = __importDefault(require("../controllers/questionControllers"));
class QuestionRoutes extends BaseRouter_1.BaseRouter {
    questionController;
    constructor() {
        super();
        this.questionController = new questionControllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', this.questionController.getQuestions);
        this.router.post('/submit', this.questionController.submitQuestions);
        this.router.post('/create', this.questionController.createQuestion);
        this.router.put('/update/:id', this.questionController.updateQuestion);
        this.router.delete('/delete/:id', this.questionController.deleteQuestion);
    }
}
exports.QuestionRoutes = QuestionRoutes;
exports.default = new QuestionRoutes().getRouter();
//# sourceMappingURL=questionRoutes.js.map