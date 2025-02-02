"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChallenge = exports.getChallenges = void 0;
const client_1 = require("@prisma/client");
const utils_1 = require("../utils");
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
//# sourceMappingURL=challengeController.js.map