"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimits = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const redis_1 = require("../services/redis");
// Base rate limit configuration
const baseConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    store: new rate_limit_redis_1.default({
        prefix: 'rate-limit:',
        // @ts-expect-error - Correct property is sendClient but types are outdated
        sendClient: redis_1.redisClient,
    }),
};
// Different rate limit configurations
exports.rateLimits = {
    // API endpoints rate limit
    api: (0, express_rate_limit_1.default)({
        ...baseConfig,
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many API requests, please try again later',
    }),
    // Authentication endpoints rate limit
    auth: (0, express_rate_limit_1.default)({
        ...baseConfig,
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // limit each IP to 5 failed login attempts per hour
        message: 'Too many login attempts, please try again later',
    }),
    // User creation rate limit
    registration: (0, express_rate_limit_1.default)({
        ...baseConfig,
        windowMs: 24 * 60 * 60 * 1000, // 24 hours
        max: 3, // limit each IP to 3 account creations per day
        message: 'Too many accounts created, please try again later',
    }),
    // Content creation rate limit
    content: (0, express_rate_limit_1.default)({
        ...baseConfig,
        max: 50, // limit each IP to 50 content creations per windowMs
        message: 'Content creation limit reached, please try again later',
    }),
};
//# sourceMappingURL=rateLimit.js.map