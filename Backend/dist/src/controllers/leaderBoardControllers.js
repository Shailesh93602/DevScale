"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboardEntries = void 0;
const leaderboardService_1 = require("../services/leaderboardService");
const leaderboardValidation_1 = require("../validations/leaderboardValidation");
const errorHandler_1 = require("../utils/errorHandler");
const utils_1 = require("../utils");
exports.getLeaderboardEntries = (0, utils_1.catchAsync)(async (req, res) => {
    const { error, value } = leaderboardValidation_1.leaderboardQuerySchema.validate(req.query);
    if (error)
        throw (0, errorHandler_1.createAppError)(error.message, 400);
    const entries = await (0, leaderboardService_1.getLeaderboard)(value.subjectId, value.timeRange, value.limit);
    res.status(200).json({
        status: 'success',
        data: entries,
    });
});
//# sourceMappingURL=leaderBoardControllers.js.map