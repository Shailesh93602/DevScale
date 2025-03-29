"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const errorHandler_1 = require("../utils/errorHandler");
const joi_1 = __importDefault(require("joi"));
const quizQuestionsRepository_1 = __importDefault(require("@/repositories/quizQuestionsRepository"));
const apiResponse_1 = require("@/utils/apiResponse");
// Validation schemas
const createQuestionSchema = joi_1.default.object({
    text: joi_1.default.string().required(),
    type: joi_1.default.string().valid('multiple_choice', 'coding').required(),
    options: joi_1.default.array()
        .items(joi_1.default.string())
        .when('type', {
        is: 'multiple_choice',
        then: joi_1.default.array().min(2).required(),
        otherwise: joi_1.default.forbidden(),
    }),
    correctAnswer: joi_1.default.string().required(),
    points: joi_1.default.number().min(1).required(),
    quiz_id: joi_1.default.string().required(),
});
const updateQuestionSchema = createQuestionSchema.keys({
    text: joi_1.default.string(),
    points: joi_1.default.number().min(1),
});
class QuestionController {
    quizQuestionsRepo;
    constructor() {
        this.quizQuestionsRepo = new quizQuestionsRepository_1.default();
    }
    // Get all questions
    getQuestions = (0, utils_1.catchAsync)(async (req, res) => {
        const questions = await this.quizQuestionsRepo.findMany({
            include: {
                options: true,
            },
            orderBy: { created_at: 'asc' },
        });
        (0, apiResponse_1.sendResponse)(res, 'QUESTIONS_FETCHED', { data: questions });
    });
    // Create new question
    createQuestion = (0, utils_1.catchAsync)(async (req, res) => {
        const { error, value } = createQuestionSchema.validate(req.body);
        if (error) {
            throw (0, errorHandler_1.createAppError)(error.details[0].message, 400);
        }
        const question = await this.quizQuestionsRepo.create({
            data: {
                question: value.text,
                type: value.type,
                quiz_id: value.quizId,
                options: value.options
                    ? {
                        create: value.options.map((option) => ({
                            text: option,
                            isCorrect: option === value.correctAnswer,
                        })),
                    }
                    : undefined,
            },
            include: {
                options: true,
            },
        });
        (0, apiResponse_1.sendResponse)(res, 'QUESTION_CREATED', { data: question });
    });
    // Update existing question
    updateQuestion = (0, utils_1.catchAsync)(async (req, res) => {
        const questionId = req.params.id;
        const { error, value } = updateQuestionSchema.validate(req.body);
        if (error) {
            throw (0, errorHandler_1.createAppError)(error.details[0].message, 400);
        }
        const question = await this.quizQuestionsRepo.update({
            where: { id: questionId },
            data: {
                question: value.text,
                type: value.type,
                options: value.options
                    ? {
                        deleteMany: {},
                        create: value.options.map((option) => ({
                            text: option,
                            isCorrect: option === value.correctAnswer,
                        })),
                    }
                    : undefined,
            },
            include: {
                options: true,
            },
        });
        (0, apiResponse_1.sendResponse)(res, 'QUESTION_UPDATED', { data: question });
    });
    // Delete question
    deleteQuestion = (0, utils_1.catchAsync)(async (req, res) => {
        const questionId = req.params.id;
        await this.quizQuestionsRepo.delete({
            where: { id: questionId },
        });
        (0, apiResponse_1.sendResponse)(res, 'QUESTION_DELETED', { data: null });
    });
    // Submit multiple questions (existing implementation)
    submitQuestions = (0, utils_1.catchAsync)(async (req, res) => {
        const { questions } = req.body;
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            throw (0, errorHandler_1.createAppError)('Invalid questions data', 400);
        }
        const questionData = questions.map((question) => ({
            question: question.text,
            type: question.type,
            correctAnswer: question.correctAnswer,
            points: question.points,
            quiz_id: question.quizId,
            options: question.options
                ? {
                    create: question.options.map((option) => ({
                        text: option,
                        isCorrect: option === question.correctAnswer,
                    })),
                }
                : undefined,
            testCases: question.testCases
                ? {
                    create: question.testCases,
                }
                : undefined,
        }));
        await this.quizQuestionsRepo.createMany({
            data: questionData,
            skipDuplicates: true,
        });
        (0, apiResponse_1.sendResponse)(res, 'QUESTIONS_SUBMITTED', { data: null });
    });
}
exports.default = QuestionController;
//# sourceMappingURL=questionControllers.js.map