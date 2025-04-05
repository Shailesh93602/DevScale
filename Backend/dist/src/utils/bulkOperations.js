"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkOperations = void 0;
const prisma_1 = __importDefault(require("@/lib/prisma"));
class BulkOperations {
    prismaClient;
    constructor(prismaClient = prisma_1.default) {
        this.prismaClient = prismaClient;
    }
    static async bulkCreateUsers(users) {
        try {
            return await prisma_1.default.user.createMany({
                data: users,
                skipDuplicates: true,
            });
        }
        catch (error) {
            return this.handleError('bulkCreateUsers', error);
        }
    }
    static async bulkUpdateResources(updates) {
        try {
            return await prisma_1.default.$transaction(updates.map(({ id, data }) => prisma_1.default.resource.update({
                where: { id },
                data,
            })));
        }
        catch (error) {
            return this.handleError('bulkUpdateResources', error);
        }
    }
    static async bulkDeleteChallenges(ids) {
        try {
            return await prisma_1.default.challenge.deleteMany({
                where: { id: { in: ids } },
            });
        }
        catch (error) {
            return this.handleError('bulkDeleteChallenges', error);
        }
    }
    static handleError(operation, error) {
        console.error(`Bulk operation ${operation} failed:`, error);
        return {
            success: false,
            message: `Bulk operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            error,
        };
    }
}
exports.BulkOperations = BulkOperations;
//# sourceMappingURL=bulkOperations.js.map