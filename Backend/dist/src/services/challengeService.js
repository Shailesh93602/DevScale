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
    const { topic_id, test_cases, ...challenge_data } = data;
    return prisma.challenge.create({
        data: {
            ...challenge_data,
            topic: { connect: { id: topic_id } },
            test_cases: { create: test_cases },
        },
    });
};
exports.createChallenge = createChallenge;
const updateChallenge = async (id, data) => {
    return prisma.challenge.update({
        where: { id },
        data: {
            ...data,
            test_cases: data.test_cases
                ? { deleteMany: {}, create: data.test_cases }
                : undefined,
        },
    });
};
exports.updateChallenge = updateChallenge;
const getChallenge = async (id) => {
    const challenge = await prisma.challenge.findUnique({
        where: { id },
        include: { test_cases: { where: { is_hidden: false } } },
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
    const challenge = await (0, exports.getChallenge)(data.challenge_id);
    const test_cases = await prisma.testCase.findMany({
        where: { challenge_id: data.challenge_id },
    });
    const results = await Promise.all(test_cases.map(async (test_case) => {
        try {
            const result = await (0, codeExecutor_1.executeCode)({
                code: data.code,
                language: data.language,
                input: test_case.input,
                timeLimit: challenge.time_limit ?? 0,
                memoryLimit: challenge.memory_limit ?? 0,
            });
            return {
                passed: result.output.trim() === test_case.output.trim(),
                execution_time: result.executionTime,
                memory_used: result.memoryUsed,
            };
        }
        catch (error) {
            logger_1.default.error('Code execution error:', error);
            return { passed: false, error: error.message };
        }
    }));
    const allPassed = results.every((r) => r.passed);
    const avgExecutionTime = results.reduce((acc, r) => acc + (r.execution_time || 0), 0) /
        results.length;
    const maxMemoryUsed = Math.max(...results.map((r) => r.memory_used || 0));
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
            where: { user_id: data.user_id },
            update: { points: { increment: calculatePoints(challenge.difficulty) } },
            create: {
                user_id: data.user_id,
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
            challenge_id: challengeId,
            status: 'accepted',
            user_id: { in: leaderboard.map((l) => l.user_id) },
        },
        orderBy: { runtime_ms: 'asc' },
    });
    return leaderboard.map((l) => ({
        ...l,
        bestSubmission: submissions.find((s) => s.user_id === l.user_id),
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