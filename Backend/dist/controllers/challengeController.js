"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeController = exports.getChallenge = exports.getChallenges = void 0;
const client_1 = require("@prisma/client");
const utils_1 = require("../utils");
const challengeService_1 = require("../services/challengeService");
const errorHandler_1 = require("../middlewares/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const adminResourceService_1 = require("../services/adminResourceService");
const prisma = new client_1.PrismaClient();
exports.getChallenges = (0, utils_1.catchAsync)(async (req, res) => {
    const { page = '1', limit = '10', search = '' } = req.query;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;
    const whereCondition = search
        ? {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                {
                    description: { contains: search, mode: 'insensitive' },
                },
            ],
        }
        : {};
    const [challenges, totalCount] = await Promise.all([
        prisma.challenge.findMany({
            where: whereCondition,
            take: pageSize,
            skip,
            orderBy: { created_at: 'desc' },
        }),
        prisma.challenge.count({ where: whereCondition }),
    ]);
    const totalPages = Math.ceil(totalCount / pageSize);
    res.status(200).json({
        challenges,
        currentPage: pageNumber,
        totalPages,
        totalChallenges: totalCount,
    });
});
exports.getChallenge = (0, utils_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { page = '1', limit = '10', search = '' } = req.query;
    if (id) {
        const challenge = await prisma.challenge.findUnique({
            where: { id },
        });
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        return res.status(200).json(challenge);
    }
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;
    const whereCondition = search
        ? {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                {
                    description: { contains: search, mode: 'insensitive' },
                },
            ],
        }
        : {};
    const [challenges, totalCount] = await Promise.all([
        prisma.challenge.findMany({
            where: whereCondition,
            take: pageSize,
            skip,
            orderBy: { created_at: 'desc' },
        }),
        prisma.challenge.count({ where: whereCondition }),
    ]);
    const totalPages = Math.ceil(totalCount / pageSize);
    res.status(200).json({
        challenges,
        currentPage: pageNumber,
        totalPages,
        totalChallenges: totalCount,
    });
});
class ChallengeController {
    static async createChallenge(req, res) {
        try {
            const challenge = await (0, challengeService_1.createChallenge)(req.body);
            res.status(201).json({
                status: 'success',
                data: { challenge },
            });
        }
        catch (error) {
            logger_1.default.error('Error creating challenge:', error);
            throw (0, errorHandler_1.createAppError)('Failed to create challenge', 400);
        }
    }
    static async updateChallenge(req, res) {
        try {
            const { id } = req.params;
            const challenge = await (0, challengeService_1.updateChallenge)(id, req.body);
            res.status(200).json({
                status: 'success',
                data: { challenge },
            });
        }
        catch (error) {
            logger_1.default.error('Error updating challenge:', error);
            throw (0, errorHandler_1.createAppError)('Failed to update challenge', 400);
        }
    }
    static async getChallenge(req, res) {
        try {
            const challenge = await (0, adminResourceService_1.getChallengeStats)();
            res.status(200).json({
                status: 'success',
                data: { challenge },
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching challenge:', error);
            throw (0, errorHandler_1.createAppError)('Failed to fetch challenge', 400);
        }
    }
    static async getAllChallenges(req, res) {
        try {
            const { difficulty, category, tags } = req.query;
            const challenges = await (0, challengeService_1.getAllChallenges)({
                difficulty: difficulty,
                category: category,
                tags: tags ? tags.split(',') : undefined,
            });
            res.status(200).json({
                status: 'success',
                data: { challenges },
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching challenges:', error);
            throw (0, errorHandler_1.createAppError)('Failed to fetch challenges', 400);
        }
    }
    static async submitChallenge(req, res) {
        try {
            const user_id = req.user?.id;
            if (!user_id)
                throw (0, errorHandler_1.createAppError)('User not found', 404);
            const { challenge_id } = req.params;
            const { code, language } = req.body;
            const submission = await (0, challengeService_1.submitChallenge)({
                code,
                language,
                user_id,
                challenge_id,
            });
            res.status(200).json({
                status: 'success',
                data: { submission },
            });
        }
        catch (error) {
            logger_1.default.error('Error submitting challenge:', error);
            throw (0, errorHandler_1.createAppError)('Failed to submit challenge', 400);
        }
    }
    static async getLeaderboard(req, res) {
        try {
            const { challengeId } = req.query;
            const leaderboard = await (0, challengeService_1.getLeaderboard)(challengeId);
            res.status(200).json({
                status: 'success',
                data: { leaderboard },
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching leaderboard:', error);
            throw (0, errorHandler_1.createAppError)('Failed to fetch leaderboard', 400);
        }
    }
}
exports.ChallengeController = ChallengeController;
//# sourceMappingURL=challengeController.js.map