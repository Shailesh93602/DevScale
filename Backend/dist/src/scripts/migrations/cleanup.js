"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupData = cleanupData;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../../utils/logger"));
const prisma = new client_1.PrismaClient();
async function cleanupData() {
    try {
        // Remove duplicate emails
        const duplicateEmails = await prisma.$queryRaw `
      SELECT email, COUNT(*)
      FROM "User"
      GROUP BY email
      HAVING COUNT(*) > 1
    `;
        for (const { email } of duplicateEmails) {
            const users = await prisma.user.findMany({
                where: { email },
                orderBy: { created_at: 'asc' },
            });
            // Keep the oldest user, delete the rest
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [keep, ...remove] = users;
            await prisma.user.deleteMany({
                where: {
                    email,
                    id: { in: remove.map((u) => u.id) },
                },
            });
        }
        // Clean up soft-deleted records older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        await prisma.user.deleteMany({
            where: {
                deleted_at: {
                    lt: thirtyDaysAgo,
                },
            },
        });
        logger_1.default.info('Data cleanup completed successfully');
    }
    catch (error) {
        logger_1.default.error('Error during data cleanup:', error);
        throw error;
    }
}
//# sourceMappingURL=cleanup.js.map