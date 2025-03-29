"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const quizRepository_1 = __importDefault(require("@/repositories/quizRepository"));
const quizQuestionsRepository_1 = __importDefault(require("@/repositories/quizQuestionsRepository"));
const quizAnswerRepository_1 = __importDefault(require("@/repositories/quizAnswerRepository"));
const quizSubmissionRepository_1 = __importDefault(require("@/repositories/quizSubmissionRepository"));
const apiResponse_1 = require("@/utils/apiResponse");
const errorHandler_1 = require("@/utils/errorHandler");
class QuizController {
    quizRepo;
    quizQuestionRepo;
    quizAnswerRepo;
    quizSubmissionRepo;
    constructor() {
        this.quizRepo = new quizRepository_1.default();
        this.quizQuestionRepo = new quizQuestionsRepository_1.default();
        this.quizAnswerRepo = new quizAnswerRepository_1.default();
        this.quizSubmissionRepo = new quizSubmissionRepository_1.default();
    }
    createQuiz = (0, index_1.catchAsync)(async (req, res) => {
        const { topic_id, passing_score, questions, type } = req.body;
        const quiz = await this.quizRepo.create({
            data: {
                topic_id,
                passing_score,
                title: 'Quiz',
                description: 'Quiz',
                type,
            },
        });
        if (questions && questions.length > 0) {
            const quizQuestions = questions.map((question) => ({
                quizId: quiz.id,
                question: question.question,
            }));
            await this.quizQuestionRepo.createMany({ data: quizQuestions });
        }
        (0, apiResponse_1.sendResponse)(res, 'QUIZ_CREATED', {
            data: {
                quiz,
            },
        });
    });
    submitQuiz = (0, index_1.catchAsync)(async (req, res) => {
        const user_id = req.user?.id;
        const { quiz_id, answers } = req.body;
        const quiz = (await this.quizRepo.findUnique({
            where: { id: quiz_id },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        }));
        if (!quiz) {
            throw (0, errorHandler_1.createAppError)('Quiz not found', 404);
        }
        let score = 0;
        for (const submittedAnswer of answers) {
            const question = quiz.questions && Array.isArray(quiz.questions)
                ? quiz.questions.find((q) => q.id === submittedAnswer.question_id)
                : null;
            if (question && question.correct_answer === submittedAnswer.answer) {
                score += 1;
            }
        }
        const completed = score >= quiz.passing_score;
        const submission = await this.quizSubmissionRepo.create({
            data: {
                user_id,
                quiz_id,
                score,
                time_spent: 0,
                is_passed: completed,
                results: score,
            },
        });
        const submissionAnswers = answers.map((answer) => ({
            submissionId: submission.id,
            questionId: answer.questionId,
            answer: answer.answer,
        }));
        await this.quizAnswerRepo.createMany({ data: submissionAnswers });
        (0, apiResponse_1.sendResponse)(res, 'QUIZ_SUBMITTED', {
            data: {
                submission,
                completed,
            },
        });
    });
    getUserProgress = (0, index_1.catchAsync)(async (req, res) => {
        const { user_id } = req.params;
        const progress = await this.quizSubmissionRepo.findMany({
            where: { user_id },
            include: {
                quiz: {
                    include: {
                        topic: {
                            select: {
                                title: true,
                                subjects: {
                                    select: {
                                        subject_id: true,
                                        subject: {
                                            select: {
                                                title: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        (0, apiResponse_1.sendResponse)(res, 'USER_PROGRESS_FETCHED', {
            data: {
                progress,
            },
        });
    });
}
exports.default = QuizController;
//# sourceMappingURL=quizController.js.map