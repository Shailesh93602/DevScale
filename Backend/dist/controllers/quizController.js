"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProgress = exports.submitQuiz = exports.createQuiz = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const index_1 = require("../utils/index");
exports.createQuiz = (0, index_1.catchAsync)(async (req, res) => {
    const { topicId, passingScore, questions, type } = req.body;
    const quiz = await prisma_1.default.quiz.create({
        data: {
            topicId,
            passingScore,
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
        await prisma_1.default.quizQuestion.createMany({ data: quizQuestions });
    }
    res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        quiz,
    });
});
exports.submitQuiz = (0, index_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const { quizId, answers } = req.body;
    const quiz = await prisma_1.default.quiz.findUnique({
        where: { id: quizId },
        include: {
            questions: {
                include: {
                    options: true,
                },
            },
        },
    });
    if (!quiz) {
        return res.status(404).json({
            success: false,
            message: 'Quiz not found',
        });
    }
    let score = 0;
    for (const submittedAnswer of answers) {
        const question = quiz.questions.find((q) => q.id === submittedAnswer.questionId);
        if (question && question.correctAnswer === submittedAnswer.answer) {
            score += 1;
        }
    }
    const completed = score >= quiz.passingScore;
    const submission = await prisma_1.default.quizSubmission.create({
        data: {
            userId,
            quizId,
            score,
            timeSpent: 0,
            isPassed: completed,
            results: score,
            user: { connect: { id: userId } },
            quiz: { connect: { id: quizId } },
        },
    });
    const submissionAnswers = answers.map((answer) => ({
        submissionId: submission.id,
        questionId: answer.questionId,
        answer: answer.answer,
    }));
    await prisma_1.default.quizAnswer.createMany({ data: submissionAnswers });
    res.status(201).json({
        success: true,
        message: 'Quiz submitted successfully',
        submission,
        completed,
    });
});
exports.getUserProgress = (0, index_1.catchAsync)(async (req, res) => {
    const { userId } = req.params;
    const progress = await prisma_1.default.quizSubmission.findMany({
        where: { userId },
        include: {
            quiz: {
                include: {
                    topic: {
                        select: {
                            title: true,
                            subjectId: true,
                        },
                    },
                },
            },
        },
    });
    res.status(200).json({
        success: true,
        progress,
    });
});
//# sourceMappingURL=quizController.js.map