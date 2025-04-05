"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyService = exports.revokeApiKey = exports.validateApiKey = exports.generateApiKey = void 0;
const errorHandler_1 = require("../utils/errorHandler");
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../utils/logger"));
const prisma_1 = __importDefault(require("@/lib/prisma"));
const generateApiKey = async (user_id, scope = ['read']) => {
    const apiKey = crypto_1.default.randomBytes(32).toString('hex');
    const hashedKey = crypto_1.default.createHash('sha256').update(apiKey).digest('hex');
    await prisma_1.default.apiKey.create({
        data: {
            user_id,
            key: hashedKey,
            scope,
            last_used: new Date(),
        },
    });
    logger_1.default.info(`API key generated for user ${user_id}`);
    return apiKey;
};
exports.generateApiKey = generateApiKey;
const validateApiKey = async (apiKey) => {
    const hashedKey = crypto_1.default.createHash('sha256').update(apiKey).digest('hex');
    const key = await prisma_1.default.apiKey.findUnique({
        where: { key: hashedKey },
    });
    if (!key)
        return false;
    await prisma_1.default.apiKey.update({
        where: { id: key.id },
        data: { last_used: new Date() },
    });
    return true;
};
exports.validateApiKey = validateApiKey;
const revokeApiKey = async (apiKey) => {
    const hashedKey = crypto_1.default.createHash('sha256').update(apiKey).digest('hex');
    await prisma_1.default.apiKey.delete({ where: { key: hashedKey } });
    logger_1.default.info('API key revoked');
};
exports.revokeApiKey = revokeApiKey;
class ApiKeyService {
    static async validateApiKey(key) {
        const apiKey = await prisma_1.default.apiKey.findUnique({
            where: { key },
            select: {
                id: true,
                expires_at: true,
            },
        });
        if (!apiKey || (apiKey.expires_at && apiKey.expires_at < new Date())) {
            throw (0, errorHandler_1.createAppError)('Invalid or expired API key', 401);
        }
        return true;
    }
    static async createApiKey(userId) {
        const key = crypto_1.default.randomBytes(32).toString('hex');
        await prisma_1.default.apiKey.create({
            data: {
                key,
                user_id: userId,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
        });
        return key;
    }
    static async deactivateApiKey(key) {
        await prisma_1.default.apiKey.update({
            where: { key },
            data: {
                expires_at: new Date(),
            },
        });
    }
}
exports.ApiKeyService = ApiKeyService;
//# sourceMappingURL=apiKeyService.js.map