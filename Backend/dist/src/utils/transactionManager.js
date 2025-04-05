"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionManager = void 0;
const logger_1 = __importDefault(require("./logger"));
const prisma_1 = __importDefault(require("../lib/prisma"));
class TransactionManager {
    static async transaction(callback, options) {
        const maxRetries = options?.maxRetries || 3;
        const timeout = options?.timeout || 5000;
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                const result = await Promise.race([
                    prisma_1.default.$transaction(callback),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Transaction timeout')), timeout)),
                ]);
                return result;
            }
            catch (error) {
                attempt++;
                if (attempt === maxRetries) {
                    logger_1.default.error('Transaction failed after max retries:', error);
                    throw error;
                }
                logger_1.default.warn(`Transaction attempt ${attempt} failed, retrying...`, error);
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }
        throw new Error('Transaction failed');
    }
}
exports.TransactionManager = TransactionManager;
//# sourceMappingURL=transactionManager.js.map