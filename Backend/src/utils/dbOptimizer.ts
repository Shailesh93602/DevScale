import { PrismaClient } from '@prisma/client';
import logger from './logger';

const prisma = new PrismaClient();

export class DbOptimizer {
  static async analyzeQueries(): Promise<void> {
    try {
      // Enable query logging
      prisma.$use(async (params, next) => {
        const start = Date.now();
        const result = await next(params);
        const duration = Date.now() - start;

        if (duration > 100) {
          // Log slow queries (>100ms)
          logger.warn('Slow query detected:', {
            model: params.model,
            action: params.action,
            duration,
            args: params.args,
          });
        }

        return result;
      });
    } catch (error) {
      logger.error('Query analysis error:', error);
    }
  }

  static async vacuum(): Promise<void> {
    try {
      // Run VACUUM ANALYZE on PostgreSQL
      await prisma.$executeRawUnsafe('VACUUM ANALYZE');
    } catch (error) {
      logger.error('Vacuum error:', error);
    }
  }

  static async reindex(): Promise<void> {
    try {
      // Reindex database
      await prisma.$executeRawUnsafe('REINDEX DATABASE current_database()');
    } catch (error) {
      logger.error('Reindex error:', error);
    }
  }

  static async optimizeIndexes(): Promise<void> {
    try {
      // Analyze index usage
      const unusedIndexes = await prisma.$queryRaw`
        SELECT schemaname, tablename, indexname, idx_scan
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
        AND indexname NOT LIKE 'pk_%'
        AND indexname NOT LIKE 'unique_%';
      `;

      logger.info('Unused indexes:', unusedIndexes);
    } catch (error) {
      logger.error('Index optimization error:', error);
    }
  }
}
