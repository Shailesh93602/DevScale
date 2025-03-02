"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionManager = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("./logger"));
const prisma = new client_1.PrismaClient();
class TransactionManager {
    static async execute(callback, context) {
        const startTime = Date.now();
        try {
            const result = await prisma.$transaction(async (tx) => {
                return await callback(tx);
            });
            logger_1.default.info(`Transaction completed: ${context}`, {
                duration: Date.now() - startTime,
            });
            return result;
        }
        catch (error) {
            logger_1.default.error(`Transaction failed: ${context}`, {
                error,
                duration: Date.now() - startTime,
            });
            throw error;
        }
    }
    static async executeWithRetry(callback, context, maxRetries = 3) {
        let attempts = 0;
        while (attempts < maxRetries) {
            try {
                return await this.execute(callback, context);
            }
            catch (error) {
                attempts++;
                if (attempts === maxRetries)
                    throw error;
                // Exponential backoff
                await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 1000));
            }
        }
        throw new Error('Max retry attempts reached');
    }
}
exports.TransactionManager = TransactionManager;
//# sourceMappingURL=transactionManager.js.map