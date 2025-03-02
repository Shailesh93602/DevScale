"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.cacheResponse = void 0;
const cacheService_1 = require("../services/cacheService");
const logger_1 = __importDefault(require("../utils/logger"));
const cacheResponse = (options) => {
    return async (req, res, next) => {
        try {
            // Skip cache based on condition
            if (options.condition && !options.condition(req)) {
                return next();
            }
            // Generate cache key
            const cacheKey = typeof options.key === 'function'
                ? options.key(req)
                : options.key || `${req.method}:${req.originalUrl}`;
            // Try to get from cache
            const cachedData = await (0, cacheService_1.getCache)(cacheKey);
            if (cachedData) {
                return res.json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData);
            }
            // Store original send function
            const originalSend = res.json;
            // Override send function to cache response
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            res.json = function (body) {
                (0, cacheService_1.setCache)(cacheKey, JSON.stringify(body), { ttl: options.duration }).catch((error) => logger_1.default.error('Cache set failed:', error));
                return originalSend.call(this, body);
            };
            next();
        }
        catch (error) {
            logger_1.default.error('Cache middleware error:', error);
            next();
        }
    };
};
exports.cacheResponse = cacheResponse;
const clearCache = (pattern) => {
    return async (_req, _res, next) => {
        try {
            await (0, cacheService_1.deleteCache)(pattern);
            next();
        }
        catch (error) {
            logger_1.default.error('Cache clear failed:', error);
            next();
        }
    };
};
exports.clearCache = clearCache;
//# sourceMappingURL=cacheControl.js.map