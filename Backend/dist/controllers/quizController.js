"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProgress = exports.submitQuiz = exports.createQuiz = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const index_1 = require("../utils/index");
exports.createQuiz = (0, index_1.catchAsync)(async (req, res) => {
    const { topic_id, passing_score, questions, type } = req.body;
    const quiz = await prisma_1.default.quiz.create({
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
        await prisma_1.default.quizQuestion.createMany({ data: quizQuestions });
    }
    res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        quiz,
    });
});
exports.submitQuiz = (0, index_1.catchAsync)(async (req, res) => {
    const user_id = req.user.id;
    const { quiz_id, answers } = req.body;
    const quiz = await prisma_1.default.quiz.findUnique({
        where: { id: quiz_id },
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
        const question = quiz.questions.find((q) => q.id === submittedAnswer.question_id);
        if (question && question.correct_answer === submittedAnswer.answer) {
            score += 1;
        }
    }
    const completed = score >= quiz.passing_score;
    const submission = await prisma_1.default.quizSubmission.create({
        data: {
            user_id,
            quiz_id,
            score,
            time_spent: 0,
            is_passed: completed,
            results: score,
            user: { connect: { id: user_id } },
            quiz: { connect: { id: quiz_id } },
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
    const { user_id } = req.params;
    const progress = await prisma_1.default.quizSubmission.findMany({
        where: { user_id },
        include: {
            quiz: {
                include: {
                    topic: {
                        select: {
                            title: true,
                            subject_id: true,
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