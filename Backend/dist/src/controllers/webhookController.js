"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const userService_1 = require("../services/userService");
class WebhookController {
    static async handleUserCreated(req, res) {
        try {
            const { user } = req.body;
            await (0, userService_1.createUserProfile)(user.id, {
                email: user.email,
                username: user.user_metadata?.username || user.email.split('@')[0],
                experienceLevel: user.user_metadata?.experience_level || 'beginner',
                learningGoals: user.user_metadata?.learning_goals || [],
            });
            res.status(200).json({ received: true });
        }
        catch (error) {
            logger_1.default.error('Webhook error:', error);
            res.status(400).json({ error: 'Failed to process webhook' });
        }
    }
}
exports.WebhookController = WebhookController;
//# sourceMappingURL=webhookController.js.map