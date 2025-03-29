"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const battleRepository_1 = require("@/repositories/battleRepository");
const logger_1 = __importDefault(require("@/utils/logger"));
const apiResponse_1 = require("@/utils/apiResponse");
const errorHandler_1 = require("@/utils/errorHandler");
class BattleController {
    battleRepo;
    constructor() {
        this.battleRepo = new battleRepository_1.BattleRepository();
    }
    getBattles = (0, utils_1.catchAsync)(async (req, res) => {
        const battles = await this.battleRepo.findMany();
        (0, apiResponse_1.sendResponse)(res, 'BATTLES_FETCHED', { data: battles });
    });
    getBattle = (0, utils_1.catchAsync)(async (req, res) => {
        try {
            const battle = await this.battleRepo.findUnique({
                where: { id: req.params.id },
            });
            (0, apiResponse_1.sendResponse)(res, 'BATTLES_FETCHED', { data: battle });
        }
        catch (error) {
            logger_1.default.error('Error: ', error);
            (0, errorHandler_1.createAppError)('Battle not found', 404);
        }
    });
    createBattle = (0, utils_1.catchAsync)(async (req, res) => {
        const { title, description, topic_id, difficulty, length, date, time } = req.body;
        await this.battleRepo.create({
            data: {
                title,
                description,
                topic_id,
                difficulty,
                length,
                date,
                time,
                user_id: req.user.id,
            },
        });
        (0, apiResponse_1.sendResponse)(res, 'BATTLE_CREATED');
    });
}
exports.default = BattleController;
//# sourceMappingURL=battleControllers.js.map