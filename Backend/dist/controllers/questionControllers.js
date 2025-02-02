"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuestions = exports.getQuestions = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const index_1 = require("../utils/index");
exports.getQuestions = (0, index_1.catchAsync)(async (req, res) => {
    const questions = await prisma_1.default.quizQuestion.findMany({
        orderBy: { created_at: 'asc' },
    });
    res.status(200).json({ success: true, questions });
});
exports.submitQuestions = (0, index_1.catchAsync)(async (req, res) => {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res
            .status(400)
            .json({ success: false, message: 'Invalid questions data' });
    }
    // TODO: implement this method
    // const questionData = questions.map((question: { text: string }) => ({
    // text: question.text,
    // }));
    // await prisma.quizQuestion.createMany({ data: questionData });
    res
        .status(201)
        .json({ success: true, message: 'Questions submitted successfully' });
});
//# sourceMappingURL=questionControllers.js.map