"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBattle = exports.getBattle = exports.getBattles = void 0;
const client_1 = require("@prisma/client");
const utils_1 = require("../utils");
const prisma = new client_1.PrismaClient();
exports.getBattles = (0, utils_1.catchAsync)(async (req, res) => {
    const battles = await prisma.battle.findMany({
        orderBy: { created_at: 'asc' },
        include: {
            topic: {
                select: { title: true },
            },
        },
    });
    res.status(200).json({ success: true, battles });
});
exports.getBattle = (0, utils_1.catchAsync)(async (req, res) => {
    const battleId = req.params.id;
    const battle = await prisma.battle.findUnique({
        where: { id: battleId },
    });
    if (!battle) {
        return res
            .status(404)
            .json({ success: false, message: 'Battle not found' });
    }
    res.status(200).json({ success: true, battle });
});
exports.createBattle = (0, utils_1.catchAsync)(async (req, res) => {
    const { title, description, topicId, difficulty, length, date, time } = req.body;
    await prisma.battle.create({
        data: {
            title,
            description,
            userId: req.user.id,
            topicId,
            difficulty,
            length,
            date,
            time,
        },
    });
    res
        .status(201)
        .json({ success: true, message: 'Battle created successfully!' });
});
//# sourceMappingURL=battleControllers.js.map