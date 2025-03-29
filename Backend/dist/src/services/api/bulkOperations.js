"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class BulkOperationsService {
    async bulkCreateUsers(users) {
        return this.executeBulkOperation(users, async (userData, tx) => {
            return tx.user.create({ data: userData });
        }, {
            batchSize: 50,
            context: 'Bulk User Creation',
        });
    }
    static async bulkUpdateRoadmaps(updates) {
        return this.executeBulkOperation(updates, async (update, tx) => {
            return tx.roadmap.update({
                where: { id: update.id },
                data: update.data,
            });
        }, {
            batchSize: 25,
            context: 'Bulk Roadmap Update',
        });
    }
    static async bulkDeleteTopics(topicIds) {
        return this.executeBulkOperation(topicIds, async (id, tx) => {
            return tx.topic.delete({
                where: { id },
            });
        }, {
            batchSize: 10,
            continueOnError: true,
            context: 'Bulk Topic Deletion',
        });
    }
    static async executeBulkOperation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    operation, config) {
        const results = [];
        for (let i = 0; i < items.length; i += config.batchSize) {
            const batch = items.slice(i, i + config.batchSize);
            try {
                const batchResults = await prisma.$transaction(async (tx) => {
                    const batchPromises = batch.map((item) => operation(item, tx).catch((error) => {
                        if (config.continueOnError) {
                            console.error(`${config.context} error:`, error);
                            return null;
                        }
                        throw error;
                    }));
                    return Promise.all(batchPromises);
                });
                results.push(...batchResults.filter(Boolean));
            }
            catch (error) {
                console.error(`${config.context} failed at batch ${i / config.batchSize}:`, error);
                if (!config.continueOnError)
                    throw error;
            }
        }
        return results;
    }
}
exports.default = BulkOperationsService;
//# sourceMappingURL=bulkOperations.js.map