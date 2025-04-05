"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLimiter = exports.apiLimiter = exports.authLimiter = exports.createRateLimiter = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
let redisClient = null;
try {
    redisClient = new ioredis_1.default(config_1.REDIS_URL || 'redis://localhost:6379', {
        enableOfflineQueue: false,
        maxRetriesPerRequest: 3,
    });
    redisClient.on('error', (err) => {
        logger_1.default.error('Redis connection error:', err);
        redisClient = null;
    });
    redisClient.on('connect', () => {
        logger_1.default.info('Redis connected successfully');
    });
}
catch (err) {
    logger_1.default.error('Failed to initialize Redis:', err);
}
const createRateLimiter = (options = {}) => {
    const { windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // 100 requests per window
    message = 'Too many requests, please try again later', } = options;
    return (req, res, next) => {
        if (!redisClient) {
            next();
            return;
        }
        const key = `rate-limit:${req.ip}`;
        const windowInSeconds = Math.floor(windowMs / 1000);
        redisClient
            .multi()
            .incr(key)
            .expire(key, windowInSeconds)
            .exec()
            .then((result) => {
            if (!result) {
                next();
                return;
            }
            const [[incrErr, requestCount], [expireErr]] = result;
            if (incrErr || expireErr) {
                logger_1.default.error('Redis operation error:', { incrErr, expireErr });
                next();
                return;
            }
            const count = typeof requestCount === 'number' ? requestCount : 1;
            res.setHeader('X-RateLimit-Limit', max.toString());
            res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count).toString());
            if (count > max) {
                res.status(429).json({
                    status: 429,
                    message,
                });
                return;
            }
            next();
        })
            .catch((err) => {
            logger_1.default.error('Rate limiting error:', err);
            next();
        });
    };
};
exports.createRateLimiter = createRateLimiter;
// Different rate limits for different routes
exports.authLimiter = (0, exports.createRateLimiter)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts, please try again later',
});
exports.apiLimiter = (0, exports.createRateLimiter)({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
});
exports.uploadLimiter = (0, exports.createRateLimiter)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: 'Upload limit exceeded, please try again later',
});
//# sourceMappingURL=rateLimiter.js.map