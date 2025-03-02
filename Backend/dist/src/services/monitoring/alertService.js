"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const redis_1 = require("../redis");
const logger_1 = __importDefault(require("../../utils/logger"));
const email_1 = require("../email");
class AlertService {
    static ALERT_CONFIG_KEY = 'alert_config';
    static ALERT_HISTORY_KEY = 'alert_history';
    static async configure(config) {
        try {
            await redis_1.RedisClient.hset(this.ALERT_CONFIG_KEY, config.type, JSON.stringify(config));
            logger_1.default.info('Alert configuration updated:', config);
        }
        catch (error) {
            logger_1.default.error('Failed to update alert configuration:', error);
            throw error;
        }
    }
    static async sendAlert(type, data) {
        try {
            const config = await this.getConfig(type);
            if (!config?.enabled)
                return;
            const alert = {
                ...data,
                type,
                timestamp: Date.now(),
            };
            // Store alert in history
            await redis_1.RedisClient.zadd(this.ALERT_HISTORY_KEY, alert.timestamp, JSON.stringify(alert));
            // Send notifications based on configured channels
            for (const channel of config.channels) {
                switch (channel) {
                    case 'email':
                        await this.sendEmailAlert(alert);
                        break;
                    case 'slack':
                        await this.sendSlackAlert(alert);
                        break;
                    default:
                        logger_1.default.warn('Unknown alert channel:', channel);
                }
            }
            logger_1.default.info('Alert sent:', alert);
        }
        catch (error) {
            logger_1.default.error('Failed to send alert:', error);
        }
    }
    static async getConfig(type) {
        const config = await redis_1.RedisClient.hget(this.ALERT_CONFIG_KEY, type);
        return config ? JSON.parse(config) : null;
    }
    static async sendEmailAlert(alert) {
        await (0, email_1.sendEmail)({
            subject: `Alert: ${alert.type}`,
            text: `${alert.message}\nLevel: ${alert.level}\nTimestamp: ${new Date(alert.timestamp).toISOString()}`,
            to: process.env.ALERT_EMAIL,
        });
    }
    static async sendSlackAlert(alert) {
        // Implement Slack notification
        logger_1.default.info('Slack alert would be sent:', alert);
    }
}
exports.AlertService = AlertService;
//# sourceMappingURL=alertService.js.map