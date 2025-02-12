"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = exports.submitChallenge = exports.getAllChallenges = exports.getChallenge = exports.updateChallenge = exports.createChallenge = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const codeExecutor_1 = require("../utils/codeExecutor");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
const createChallenge = async (data) => {
    const { topicId, testCases, ...challengeData } = data;
    return prisma.challenge.create({
        data: {
            ...challengeData,
            topic: { connect: { id: topicId } },
            testCases: { create: testCases },
        },
    });
};
exports.createChallenge = createChallenge;
const updateChallenge = async (id, data) => {
    return prisma.challenge.update({
        where: { id },
        data: {
            ...data,
            testCases: data.testCases
                ? { deleteMany: {}, create: data.testCases }
                : undefined,
        },
    });
};
exports.updateChallenge = updateChallenge;
const getChallenge = async (id) => {
    const challenge = await prisma.challenge.findUnique({
        where: { id },
        include: { testCases: { where: { isHidden: false } } },
    });
    if (!challenge)
        throw (0, errorHandler_1.createAppError)('Challenge not found', 404);
    return challenge;
};
exports.getChallenge = getChallenge;
const getAllChallenges = async (filters) => {
    return prisma.challenge.findMany({
        where: {
            difficulty: filters?.difficulty,
            category: filters?.category,
            tags: filters?.tags ? { hasEvery: filters.tags } : undefined,
        },
        include: {
            _count: { select: { submissions: { where: { status: 'accepted' } } } },
        },
    });
};
exports.getAllChallenges = getAllChallenges;
const submitChallenge = async (data) => {
    const challenge = await (0, exports.getChallenge)(data.challengeId);
    const testCases = await prisma.testCase.findMany({
        where: { challengeId: data.challengeId },
    });
    const results = await Promise.all(testCases.map(async (testCase) => {
        try {
            const result = await (0, codeExecutor_1.executeCode)({
                code: data.code,
                language: data.language,
                input: testCase.input,
                timeLimit: challenge.timeLimit ?? 0,
                memoryLimit: challenge.memoryLimit ?? 0,
            });
            return {
                passed: result.output.trim() === testCase.output.trim(),
                executionTime: result.executionTime,
                memoryUsed: result.memoryUsed,
            };
        }
        catch (error) {
            logger_1.default.error('Code execution error:', error);
            return { passed: false, error: error.message };
        }
    }));
    const allPassed = results.every((r) => r.passed);
    const avgExecutionTime = results.reduce((acc, r) => acc + (r.executionTime || 0), 0) /
        results.length;
    const maxMemoryUsed = Math.max(...results.map((r) => r.memoryUsed || 0));
    const submission = await prisma.challengeSubmission.create({
        data: {
            ...data,
            status: allPassed ? 'accepted' : 'wrong_answer',
            runtime_ms: avgExecutionTime,
            memory_used_kb: maxMemoryUsed,
            feedback: results.map((r) => r.error).join('\n'),
            score: allPassed ? calculatePoints(challenge.difficulty) : 0,
        },
    });
    if (allPassed) {
        await prisma.userPoints.upsert({
            where: { userId: data.userId },
            update: { points: { increment: calculatePoints(challenge.difficulty) } },
            create: {
                userId: data.userId,
                points: calculatePoints(challenge.difficulty),
            },
        });
    }
    return submission;
};
exports.submitChallenge = submitChallenge;
const getLeaderboard = async (challengeId) => {
    const leaderboard = await prisma.userPoints.findMany({
        orderBy: { points: 'desc' },
        take: 100,
        include: { user: { select: { username: true, avatar_url: true } } },
    });
    if (!challengeId)
        return leaderboard;
    const submissions = await prisma.challengeSubmission.findMany({
        where: {
            challengeId,
            status: 'accepted',
            userId: { in: leaderboard.map((l) => l.userId) },
        },
        orderBy: { runtime_ms: 'asc' },
    });
    return leaderboard.map((l) => ({
        ...l,
        bestSubmission: submissions.find((s) => s.userId === l.userId),
    }));
};
exports.getLeaderboard = getLeaderboard;
const calculatePoints = (difficulty) => {
    switch (difficulty) {
        case client_1.Difficulty.EASY:
            return 10;
        case client_1.Difficulty.MEDIUM:
            return 20;
        case client_1.Difficulty.HARD:
            return 30;
        default:
            return 10;
    }
};
//# sourceMappingURL=challengeService.js.map