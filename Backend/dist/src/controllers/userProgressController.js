"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../middlewares/errorHandler");
const userProgressRepository_1 = __importDefault(require("../repositories/userProgressRepository"));
const userPointsRepository_1 = __importDefault(require("@/repositories/userPointsRepository"));
const utils_1 = require("@/utils");
const apiResponse_1 = require("@/utils/apiResponse");
class UserProgressController {
    userProgressRepo;
    userPointsRepo;
    constructor() {
        this.userProgressRepo = new userProgressRepository_1.default();
        this.userPointsRepo = new userPointsRepository_1.default();
    }
    getProgress = (0, utils_1.catchAsync)(async (req, res) => {
        const userId = req.user?.id;
        if (!userId)
            throw (0, errorHandler_1.createAppError)('User not found', 404);
        const [progress, achievements, experienceLevel] = await Promise.all([
            this.userProgressRepo.getUserProgress(userId),
            this.userProgressRepo.getAchievements(userId),
            this.userProgressRepo.calculateExperienceLevel(userId),
        ]);
        (0, apiResponse_1.sendResponse)(res, 'PROGRESS_FETCHED', {
            data: { ...progress, achievements, experienceLevel },
        });
    });
    updateProgress = (0, utils_1.catchAsync)(async (req, res) => {
        const userId = req.user?.id;
        if (!userId)
            throw (0, errorHandler_1.createAppError)('User not found', 404);
        const { topicId, status, score } = req.body;
        await this.userProgressRepo.updateUserProgress(userId, {
            topic_id: topicId,
            is_completed: status === 'completed',
            timeSpent: 0,
        });
        if (status === 'completed') {
            await this.userPointsRepo.updateUserPoints(userId, score || 10);
        }
        (0, apiResponse_1.sendResponse)(res, 'PROGRESS_UPDATED');
    });
}
exports.default = UserProgressController;
//# sourceMappingURL=userProgressController.js.map