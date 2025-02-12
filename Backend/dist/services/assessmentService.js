"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuiz = createQuiz;
exports.submitQuiz = submitQuiz;
exports.getQuizzesByLevel = getQuizzesByLevel;
exports.getQuizPerformance = getQuizPerformance;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middlewares/errorHandler");
const codeExecutor_1 = require("../utils/codeExecutor");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
async function createQuiz(data) {
    return prisma.quiz.create({
        data: {
            title: data.title,
            description: data.description,
            type: data.type,
            timeLimit: data.timeLimit,
            passingScore: data.passingScore,
            topicId: data.topicId,
            subjectId: data.subjectId,
            conceptId: data.conceptId,
            questions: {
                create: data.questions.map((q) => ({
                    question: q.question,
                    type: q.type,
                    options: q.options
                        ? {
                            create: q.options.map((option) => ({
                                text: option,
                                isCorrect: option === q.correctAnswer,
                            })),
                        }
                        : undefined,
                    correctAnswer: q.correctAnswer,
                    points: q.points,
                    testCases: q.testCases
                        ? q.testCases
                        : client_1.Prisma.DbNull,
                })),
            },
        },
        include: { questions: true },
    });
}
async function submitQuiz(data) {
    const quiz = await prisma.quiz.findUnique({
        where: { id: data.quizId },
        include: { questions: true },
    });
    if (!quiz)
        throw (0, errorHandler_1.createAppError)('Quiz not found', 404);
    let totalScore = 0;
    const results = [];
    for (const answer of data.answers) {
        const question = quiz.questions.find((q) => q.id === answer.questionId);
        if (!question)
            continue;
        let isCorrect = false;
        let score = 0;
        if (question.type === 'coding') {
            const testResults = await evaluateCode(answer.answer, Array.isArray(question.testCases)
                ? question.testCases
                : undefined);
            isCorrect = testResults.every((r) => r.passed);
            score = isCorrect ? question.points : 0;
        }
        else {
            isCorrect = answer.answer === question.correctAnswer;
            score = isCorrect ? question.points : 0;
        }
        totalScore += score;
        results.push({ questionId: question.id, isCorrect, score });
    }
    const submission = await prisma.quizSubmission.create({
        data: {
            userId: data.userId,
            quizId: data.quizId,
            score: totalScore,
            timeSpent: data.timeSpent,
            isPassed: totalScore >= quiz.passingScore,
            results,
        },
        include: { quiz: true },
    });
    await updateProgress(data.userId, quiz, submission.isPassed);
    return submission;
}
async function getQuizzesByLevel(type, id) {
    return prisma.quiz.findMany({
        where: {
            type,
            OR: [{ topicId: id }, { subjectId: id }, { conceptId: id }],
        },
        include: { _count: { select: { submissions: true } } },
    });
}
async function getQuizPerformance(quizId) {
    const submissions = await prisma.quizSubmission.findMany({
        where: {
            quizId,
        },
        include: {
            user: {
                select: {
                    username: true,
                    avatar_url: true,
                },
            },
        },
        orderBy: {
            score: 'desc',
        },
    });
    const totalSubmissions = submissions.length;
    const passedSubmissions = submissions.filter((s) => s.isPassed).length;
    const averageScore = submissions.reduce((acc, s) => acc + s.score, 0) / totalSubmissions;
    return {
        submissions,
        stats: {
            totalSubmissions,
            passedSubmissions,
            passRate: totalSubmissions
                ? (passedSubmissions / totalSubmissions) * 100
                : 0,
            averageScore,
        },
    };
}
async function evaluateCode(code, testCases) {
    if (!testCases)
        return [];
    const results = [];
    for (const testCase of testCases) {
        try {
            const { output } = await (0, codeExecutor_1.executeCode)({
                code,
                language: 'javascript', // Add language detection or parameter
                input: testCase.input,
            });
            results.push({
                passed: output.trim() === testCase.expectedOutput.trim(),
                input: testCase.isHidden ? '[Hidden]' : testCase.input,
                output: output.trim(),
            });
        }
        catch (error) {
            logger_1.default.error('Code execution error:', error);
            results.push({
                passed: false,
                input: testCase.isHidden ? '[Hidden]' : testCase.input,
                output: 'Execution error',
            });
        }
    }
    return results;
}
async function updateProgress(userId, quiz, passed) {
    if (!passed)
        return;
    try {
        if (quiz.topicId) {
            await updateTopicProgress(userId, quiz.topicId);
        }
        else if (quiz.subjectId) {
            await updateSubjectProgress(userId, quiz.subjectId, quiz.topicId);
        }
        else if (quiz.conceptId) {
            await updateConceptProgress(userId, quiz.conceptId);
        }
    }
    catch (error) {
        logger_1.default.error('Error updating progress:', error);
    }
}
async function updateTopicProgress(userId, topicId) {
    await prisma.userProgress.upsert({
        where: { userId_topicId: { userId, topicId } },
        update: { isCompleted: true, completedAt: new Date() },
        create: {
            userId,
            topicId,
            subjectId: '',
            isCompleted: true,
            completedAt: new Date(),
        },
    });
}
async function updateSubjectProgress(userId, subjectId, topicId) {
    await prisma.userProgress.upsert({
        where: {
            userId_topicId: {
                userId,
                topicId: topicId ?? '',
            },
        },
        update: { isCompleted: true, completedAt: new Date() },
        create: {
            userId,
            subjectId,
            topicId: topicId ?? '',
            isCompleted: true,
            completedAt: new Date(),
        },
    });
}
async function updateConceptProgress(userId, topicId) {
    await prisma.userProgress.upsert({
        where: {
            userId_topicId: {
                userId,
                topicId,
            },
        },
        update: {
            isCompleted: true,
            completedAt: new Date(),
        },
        create: {
            userId,
            subjectId: '',
            topicId,
            isCompleted: true,
            completedAt: new Date(),
        },
    });
}
//# sourceMappingURL=assessmentService.js.map