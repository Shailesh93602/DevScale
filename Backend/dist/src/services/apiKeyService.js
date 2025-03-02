"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeApiKey = exports.validateApiKey = exports.generateApiKey = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
const generateApiKey = async (user_id, scope = ['read']) => {
    const apiKey = crypto_1.default.randomBytes(32).toString('hex');
    const hashedKey = crypto_1.default.createHash('sha256').update(apiKey).digest('hex');
    await prisma.apiKey.create({
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
    const key = await prisma.apiKey.findUnique({ where: { key: hashedKey } });
    if (!key)
        return false;
    await prisma.apiKey.update({
        where: { id: key.id },
        data: { last_used: new Date() },
    });
    return true;
};
exports.validateApiKey = validateApiKey;
const revokeApiKey = async (apiKey) => {
    const hashedKey = crypto_1.default.createHash('sha256').update(apiKey).digest('hex');
    await prisma.apiKey.delete({ where: { key: hashedKey } });
    logger_1.default.info('API key revoked');
};
exports.revokeApiKey = revokeApiKey;
//# sourceMappingURL=apiKeyService.js.map