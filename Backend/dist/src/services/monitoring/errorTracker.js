"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorTracker = void 0;
const redis_1 = require("../redis");
const logger_1 = __importDefault(require("../../utils/logger"));
const alertService_1 = require("./alertService");
class ErrorTracker {
    static ERROR_KEY_PREFIX = 'error:';
    static ERROR_TTL = 24 * 60 * 60; // 24 hours
    static async trackError(error, metadata) {
        const errorKey = `${this.ERROR_KEY_PREFIX}${error.message}`;
        try {
            const existingError = await redis_1.RedisClient.get(errorKey);
            const errorRecord = existingError
                ? JSON.parse(existingError)
                : {
                    message: error.message,
                    stack: error.stack,
                    timestamp: Date.now(),
                    count: 0,
                    lastOccurrence: Date.now(),
                    metadata,
                };
            errorRecord.count++;
            errorRecord.lastOccurrence = Date.now();
            await redis_1.RedisClient.setex(errorKey, this.ERROR_TTL, JSON.stringify(errorRecord));
            // Alert if error frequency is high
            if (errorRecord.count > 10) {
                await alertService_1.AlertService.sendAlert('error_frequency', {
                    type: 'error_frequency',
                    message: `Error "${errorRecord.message}" occurred ${errorRecord.count} times`,
                    level: 'high',
                    data: { errorRecord },
                });
            }
            logger_1.default.error('Error tracked:', errorRecord);
        }
        catch (trackingError) {
            logger_1.default.error('Error tracking failed:', trackingError);
        }
    }
    static async getErrorStats(timeRange = 3600) {
        const errors = [];
        const keys = await redis_1.RedisClient.keys(`${this.ERROR_KEY_PREFIX}*`);
        for (const key of keys) {
            const errorData = await redis_1.RedisClient.get(key);
            if (errorData) {
                const error = JSON.parse(errorData);
                if (Date.now() - error.lastOccurrence <= timeRange * 1000) {
                    errors.push(error);
                }
            }
        }
        return errors;
    }
}
exports.ErrorTracker = ErrorTracker;
//# sourceMappingURL=errorTracker.js.map