import logger from './logger';
import prisma from '@/lib/prisma';

export class DbOptimizer {
  // Slow query analysis is now implemented as a Prisma Extension in src/lib/prisma.ts

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
