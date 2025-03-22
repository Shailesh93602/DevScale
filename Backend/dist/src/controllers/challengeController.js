"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChallengeLeaderboard = exports.submitChallengeAttempt = exports.getAllChallengesWithFilters = exports.getChallengeStatistics = exports.updateExistingChallenge = exports.createNewChallenge = exports.getChallenge = exports.getChallenges = void 0;
const client_1 = require("@prisma/client");
const utils_1 = require("../utils");
const apiResponse_1 = require("../utils/apiResponse");
const challengeService_1 = require("../services/challengeService");
const adminResourceService_1 = require("../services/adminResourceService");
const pagination_1 = require("../utils/pagination");
const prisma = new client_1.PrismaClient();
exports.getChallenges = (0, utils_1.catchAsync)(async (req, res) => {
    const result = await (0, pagination_1.paginate)({
        req,
        model: prisma.challenge,
        searchFields: ['title', 'description'],
    });
    return (0, apiResponse_1.sendResponse)(res, 'CHALLENGES_FETCHED', {
        data: { challenges: result.data },
        meta: result.meta,
    });
});
exports.getChallenge = (0, utils_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const challenge = await prisma.challenge.findUnique({
        where: { id },
    });
    if (!challenge) {
        return (0, apiResponse_1.sendResponse)(res, 'CHALLENGE_NOT_FOUND');
    }
    return (0, apiResponse_1.sendResponse)(res, 'CHALLENGE_FETCHED', { data: { challenge } });
});
exports.createNewChallenge = (0, utils_1.catchAsync)(async (req, res) => {
    const challenge = await (0, challengeService_1.createChallenge)(req.body);
    return (0, apiResponse_1.sendResponse)(res, 'CHALLENGE_CREATED', { data: { challenge } });
});
exports.updateExistingChallenge = (0, utils_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const challenge = await (0, challengeService_1.updateChallenge)(id, req.body);
    return (0, apiResponse_1.sendResponse)(res, 'CHALLENGE_UPDATED', { data: { challenge } });
});
exports.getChallengeStatistics = (0, utils_1.catchAsync)(async (req, res) => {
    const stats = await (0, adminResourceService_1.getChallengeStats)();
    return (0, apiResponse_1.sendResponse)(res, 'CHALLENGE_FETCHED', { data: { stats } });
});
exports.getAllChallengesWithFilters = (0, utils_1.catchAsync)(async (req, res) => {
    const { difficulty, category, tags } = req.query;
    const challenges = await (0, challengeService_1.getAllChallenges)({
        difficulty: difficulty,
        category: category,
        tags: tags ? tags.split(',') : undefined,
    });
    return (0, apiResponse_1.sendResponse)(res, 'CHALLENGES_FETCHED', { data: { challenges } });
});
exports.submitChallengeAttempt = (0, utils_1.catchAsync)(async (req, res) => {
    const user_id = req.user?.id;
    if (!user_id) {
        return (0, apiResponse_1.sendResponse)(res, 'USER_NOT_FOUND');
    }
    const { challenge_id } = req.params;
    const { code, language } = req.body;
    const submission = await (0, challengeService_1.submitChallenge)({
        code,
        language,
        user_id,
        challenge_id,
    });
    return (0, apiResponse_1.sendResponse)(res, 'CHALLENGE_SUBMITTED', { data: { submission } });
});
exports.getChallengeLeaderboard = (0, utils_1.catchAsync)(async (req, res) => {
    const { challengeId } = req.query;
    const leaderboard = await (0, challengeService_1.getLeaderboard)(challengeId);
    return (0, apiResponse_1.sendResponse)(res, 'LEADERBOARD_FETCHED', { data: { leaderboard } });
});
//# sourceMappingURL=challengeController.js.map