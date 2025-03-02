"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProgress = exports.getProgress = void 0;
const userService_1 = require("../services/userService");
const errorHandler_1 = require("../middlewares/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const getProgress = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw (0, errorHandler_1.createAppError)('User not found', 404);
        const [progress, achievements, experienceLevel] = await Promise.all([
            (0, userService_1.getUserProgress)(userId),
            (0, userService_1.getAchievements)(userId),
            (0, userService_1.calculateExperienceLevel)(userId),
        ]);
        res.status(200).json({
            status: 'success',
            data: { ...progress, achievements, experienceLevel },
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching user progress:', error);
        throw (0, errorHandler_1.createAppError)('Failed to fetch user progress', 400);
    }
};
exports.getProgress = getProgress;
const updateProgress = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw (0, errorHandler_1.createAppError)('User not found', 404);
        const { topicId, status, score } = req.body;
        await (0, userService_1.updateUserProgress)(userId, {
            topicId,
            isCompleted: status === 'completed',
            timeSpent: 0,
        });
        if (status === 'completed') {
            await (0, userService_1.updateUserPoints)(userId, score || 10);
        }
        res.status(200).json({
            status: 'success',
            message: 'Progress updated successfully',
        });
    }
    catch (error) {
        logger_1.default.error('Error updating user progress:', error);
        throw (0, errorHandler_1.createAppError)('Failed to update progress', 400);
    }
};
exports.updateProgress = updateProgress;
//# sourceMappingURL=userProgressController.js.map