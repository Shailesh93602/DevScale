"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackActivity = void 0;
const analyticsService_1 = require("../services/analyticsService");
const logger_1 = __importDefault(require("../utils/logger"));
const trackActivity = (activity) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (userId) {
                await (0, analyticsService_1.trackUserActivity)(userId, activity, {
                    path: req.path,
                    method: req.method,
                    timestamp: new Date(),
                });
            }
            next();
        }
        catch (error) {
            logger_1.default.error('Error tracking activity:', error);
            next();
        }
    };
};
exports.trackActivity = trackActivity;
//# sourceMappingURL=activityTracker.js.map