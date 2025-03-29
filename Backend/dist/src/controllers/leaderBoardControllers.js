"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const leaderboardRepository_1 = __importDefault(require("@/repositories/leaderboardRepository"));
const apiResponse_1 = require("@/utils/apiResponse");
class LeaderboardController {
    leaderboardRepo;
    constructor() {
        this.leaderboardRepo = new leaderboardRepository_1.default();
    }
    getLeaderboardEntries = (0, utils_1.catchAsync)(async (req, res) => {
        const { user_id, subject_id, limit } = req.query;
        const entries = await this.leaderboardRepo.findMany({
            where: {
                user_id: String(user_id),
                subject_id: String(subject_id),
            },
            orderBy: {
                score: 'desc',
            },
            take: Number(limit),
        });
        (0, apiResponse_1.sendResponse)(res, 'LEADERBOARD_FETCHED', {
            data: entries,
        });
    });
}
exports.default = LeaderboardController;
//# sourceMappingURL=leaderBoardControllers.js.map