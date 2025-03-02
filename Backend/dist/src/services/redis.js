"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.RedisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
const redisConnection = new ioredis_1.default(config_1.REDIS_URL);
class RedisClient {
    static async hset(key, field, value) {
        return redisConnection.hset(key, field, value);
    }
    static async hget(key, field) {
        return redisConnection.hget(key, field);
    }
    static async zadd(key, score, member) {
        return redisConnection.zadd(key, score, member);
    }
    static async zremrangebyscore(key, min, max) {
        return redisConnection.zremrangebyscore(key, min, max);
    }
    static async zrangebyscore(key, min, max) {
        return redisConnection.zrangebyscore(key, min, max);
    }
    static async get(key) {
        return redisConnection.get(key);
    }
    static async setex(key, seconds, value) {
        return redisConnection.setex(key, seconds, value);
    }
    static async keys(pattern) {
        return redisConnection.keys(pattern);
    }
}
exports.RedisClient = RedisClient;
exports.redisClient = new RedisClient();
//# sourceMappingURL=redis.js.map