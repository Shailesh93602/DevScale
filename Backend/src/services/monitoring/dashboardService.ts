import { ErrorTracker } from './errorTracker';
import { UsageAnalytics } from './usageAnalytics';
import logger from '../../utils/logger';

interface DashboardMetrics {
  performance: {
    requestLatencies: Record<string, number>;
    activeConnections: number;
    memoryUsage: number;
  };
  errors: {
    recentErrors: Array<{
      message: string;
      count: number;
      lastOccurrence: number;
    }>;
    errorRate: number;
  };
  usage: {
    popularEndpoints: Record<string, number>;
    totalRequests: number;
    activeUsers: number;
  };
}

export class DashboardService {
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const [errorStats, usageMetrics] = await Promise.all([
        ErrorTracker.getErrorStats(),
        UsageAnalytics.getPopularEndpoints(),
      ]);

      return {
        performance: {
          requestLatencies: await this.getLatencies(),
          activeConnections: await this.getActiveConnections(),
          memoryUsage: process.memoryUsage().heapUsed,
        },
        errors: {
          recentErrors: errorStats.map((error) => ({
            message: error.message,
            count: error.count,
            lastOccurrence: error.lastOccurrence,
          })),
          errorRate: this.calculateErrorRate(errorStats),
        },
        usage: {
          popularEndpoints: usageMetrics,
          totalRequests: Object.values(usageMetrics).reduce(
            (sum, count) => sum + count,
            0
          ),
          activeUsers: await this.getActiveUsers(),
        },
      };
    } catch (error) {
      logger.error('Failed to generate dashboard metrics:', error);
      throw error;
    }
  }

  private static async getLatencies(): Promise<Record<string, number>> {
    // Implementation would depend on your metrics storage
    return {};
  }

  private static async getActiveConnections(): Promise<number> {
    // Implementation would depend on your connection tracking
    return 0;
  }

  private static async getActiveUsers(): Promise<number> {
    // Implementation would depend on your user session tracking
    return 0;
  }

  private static calculateErrorRate(errors: Array<{ count: number }>): number {
    const totalErrors = errors.reduce((sum, error) => sum + error.count, 0);
    const timeWindow = 3600; // 1 hour
    return totalErrors / timeWindow;
  }
}
