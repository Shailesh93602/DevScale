"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbOptimizer = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("./logger"));
const prisma = new client_1.PrismaClient();
class DbOptimizer {
    static async analyzeQueries() {
        try {
            // Enable query logging
            prisma.$use(async (params, next) => {
                const start = Date.now();
                const result = await next(params);
                const duration = Date.now() - start;
                if (duration > 100) {
                    // Log slow queries (>100ms)
                    logger_1.default.warn('Slow query detected:', {
                        model: params.model,
                        action: params.action,
                        duration,
                        args: params.args,
                    });
                }
                return result;
            });
        }
        catch (error) {
            logger_1.default.error('Query analysis error:', error);
        }
    }
    static async vacuum() {
        try {
            // Run VACUUM ANALYZE on PostgreSQL
            await prisma.$executeRawUnsafe('VACUUM ANALYZE');
        }
        catch (error) {
            logger_1.default.error('Vacuum error:', error);
        }
    }
    static async reindex() {
        try {
            // Reindex database
            await prisma.$executeRawUnsafe('REINDEX DATABASE current_database()');
        }
        catch (error) {
            logger_1.default.error('Reindex error:', error);
        }
    }
    static async optimizeIndexes() {
        try {
            // Analyze index usage
            const unusedIndexes = await prisma.$queryRaw `
        SELECT schemaname, tablename, indexname, idx_scan
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
        AND indexname NOT LIKE 'pk_%'
        AND indexname NOT LIKE 'unique_%';
      `;
            logger_1.default.info('Unused indexes:', unusedIndexes);
        }
        catch (error) {
            logger_1.default.error('Index optimization error:', error);
        }
    }
}
exports.DbOptimizer = DbOptimizer;
//# sourceMappingURL=dbOptimizer.js.map