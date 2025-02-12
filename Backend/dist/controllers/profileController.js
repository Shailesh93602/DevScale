"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const userService_1 = require("../services/userService");
const errorHandler_1 = require("../middlewares/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
class ProfileController {
    static async updateProfile(req, res) {
        try {
            const userId = req.user?.id;
            const avatarFile = req.file;
            const user = await userService_1.UserService.updateProfile(userId, req.body, avatarFile);
            res.status(200).json({
                status: 'success',
                data: { user },
            });
        }
        catch (error) {
            logger_1.default.error('Profile update error:', error);
            throw new errorHandler_1.AppError(error.message, 400);
        }
    }
    static async getProfile(req, res) {
        try {
            const userId = req.user?.id;
            const user = await userService_1.UserService.getProfile(userId);
            res.status(200).json({
                status: 'success',
                data: { user },
            });
        }
        catch (error) {
            logger_1.default.error('Profile fetch error:', error);
            throw new errorHandler_1.AppError(error.message, 400);
        }
    }
}
exports.ProfileController = ProfileController;
//# sourceMappingURL=profileController.js.map