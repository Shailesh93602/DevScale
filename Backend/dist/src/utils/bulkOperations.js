"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkOperations = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class BulkOperations {
    prismaClient;
    constructor(prismaClient = prisma) {
        this.prismaClient = prismaClient;
    }
    static async bulkCreateUsers(users) {
        try {
            return await prisma.user.createMany({
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
            return await prisma.$transaction(updates.map(({ id, data }) => prisma.resource.update({
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
            return await prisma.challenge.deleteMany({
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