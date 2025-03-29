"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const apiResponse_1 = require("../utils/apiResponse");
const challengeRepository_1 = require("@/repositories/challengeRepository");
class ChallengeController {
    challengeRepo;
    constructor() {
        this.challengeRepo = new challengeRepository_1.ChallengeRepository();
    }
    getChallenges = (0, utils_1.catchAsync)(async (req, res) => {
        const { page = 1, limit = 10, search = '' } = req.query;
        const result = await this.challengeRepo.paginate({
            page: Number(page),
            limit: Number(limit),
            search: String(search),
        }, ['title', 'description']);
        return (0, apiResponse_1.sendResponse)(res, 'CHALLENGES_FETCHED', {
            data: { challenges: result.data },
            meta: result.meta,
        });
    });
    getChallenge = (0, utils_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const challenge = await this.challengeRepo.findUnique({
            where: { id },
        });
        if (!challenge) {
            return (0, apiResponse_1.sendResponse)(res, 'CHALLENGE_NOT_FOUND');
        }
        return (0, apiResponse_1.sendResponse)(res, 'CHALLENGE_FETCHED', { data: { challenge } });
    });
    createNewChallenge = (0, utils_1.catchAsync)(async (req, res) => {
        const challenge = await this.challengeRepo.create(req.body);
        return (0, apiResponse_1.sendResponse)(res, 'CHALLENGE_CREATED', { data: { challenge } });
    });
    updateExistingChallenge = (0, utils_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const challenge = await this.challengeRepo.update({
            where: { id },
            data: req.body,
        });
        return (0, apiResponse_1.sendResponse)(res, 'CHALLENGE_UPDATED', { data: { challenge } });
    });
    getChallengeStatistics = (0, utils_1.catchAsync)(async (req, res) => {
        const stats = await this.challengeRepo.getChallengeStats();
        return (0, apiResponse_1.sendResponse)(res, 'CHALLENGE_FETCHED', { data: { stats } });
    });
    getAllChallengesWithFilters = (0, utils_1.catchAsync)(async (req, res) => {
        const { difficulty, category, tags } = req.query;
        const challenges = await this.challengeRepo.getAllChallenges({
            difficulty: difficulty,
            category: category,
            tags: tags ? tags.split(',') : undefined,
        });
        return (0, apiResponse_1.sendResponse)(res, 'CHALLENGES_FETCHED', { data: { challenges } });
    });
    submitChallengeAttempt = (0, utils_1.catchAsync)(async (req, res) => {
        const user_id = req.user?.id;
        if (!user_id) {
            return (0, apiResponse_1.sendResponse)(res, 'USER_NOT_FOUND');
        }
        const { challenge_id } = req.params;
        const { code, language, quiz_id, answers, time_spent } = req.body;
        const submission = await this.challengeRepo.submitChallenge({
            code,
            language,
            user_id,
            challenge_id,
            quiz_id,
            answers,
            time_spent,
        });
        return (0, apiResponse_1.sendResponse)(res, 'CHALLENGE_SUBMITTED', { data: { submission } });
    });
    getChallengeLeaderboard = (0, utils_1.catchAsync)(async (req, res) => {
        const { challengeId } = req.query;
        const leaderboard = await this.challengeRepo.getLeaderboard(challengeId);
        return (0, apiResponse_1.sendResponse)(res, 'LEADERBOARD_FETCHED', {
            data: { leaderboard },
        });
    });
}
exports.default = ChallengeController;
//# sourceMappingURL=challengeController.js.map