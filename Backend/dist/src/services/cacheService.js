"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCache = getCache;
exports.setCache = setCache;
exports.deleteCache = deleteCache;
exports.invalidateCachePattern = invalidateCachePattern;
exports.getOrSetCache = getOrSetCache;
exports.getWithLock = getWithLock;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = require("../config");
const redis = new ioredis_1.default(config_1.REDIS_URL);
async function getCache(key) {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    }
    catch (error) {
        logger_1.default.error('Cache get error:', error);
        return null;
    }
}
async function setCache(key, value, options = {}) {
    try {
        const { ttl = 3600, prefix = '' } = options;
        const fullKey = prefix ? `${prefix}:${key}` : key;
        const serializedValue = JSON.stringify(value);
        if (ttl > 0) {
            await redis.setex(fullKey, ttl, serializedValue);
        }
        else {
            await redis.set(fullKey, serializedValue);
        }
    }
    catch (error) {
        logger_1.default.error('Cache set error:', error);
    }
}
async function deleteCache(key) {
    try {
        await redis.del(key);
    }
    catch (error) {
        logger_1.default.error('Cache delete error:', error);
    }
}
async function invalidateCachePattern(pattern) {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }
    catch (error) {
        logger_1.default.error('Cache pattern invalidation error:', error);
    }
}
async function getOrSetCache(key, callback, options = {}) {
    const cached = await getCache(key);
    if (cached)
        return cached;
    const fresh = await callback();
    await setCache(key, fresh, options);
    return fresh;
}
async function getWithLock(key, callback, options = {}) {
    const lockKey = `lock:${key}`;
    const lockTtl = 5; // 5 seconds lock timeout
    try {
        const cached = await getCache(key);
        if (cached)
            return cached;
        const acquired = await redis.set(lockKey, '1', 'EX', lockTtl, 'NX');
        if (!acquired) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return getWithLock(key, callback, options);
        }
        const fresh = await callback();
        await setCache(key, fresh, options);
        return fresh;
    }
    finally {
        await redis.del(lockKey);
    }
}
//# sourceMappingURL=cacheService.js.map