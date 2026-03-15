import { RedisClient } from '../redis';
import logger from '../../utils/logger';

interface UsageMetrics {
  endpoint: string;
  method: string;
  timestamp: number;
  userId?: string;
  duration: number;
  statusCode: number;
}

export class UsageAnalytics {
  private static readonly METRICS_KEY = 'usage_metrics';
  private static readonly RETENTION_DAYS = 30;

  static async trackRequest(metrics: UsageMetrics) {
    try {
      await RedisClient.zadd(
        this.METRICS_KEY,
        metrics.timestamp,
        JSON.stringify(metrics)
      );

      // Cleanup old data
      const cutoff = Date.now() - this.RETENTION_DAYS * 24 * 60 * 60 * 1000;
      await RedisClient.zremrangebyscore(this.METRICS_KEY, 0, cutoff);

      logger.debug('Usage metrics tracked:', metrics);
    } catch (error) {
      logger.error('Failed to track usage metrics:', error);
    }
  }

  static async getMetrics(
    startTime: number,
    endTime: number
  ): Promise<UsageMetrics[]> {
    try {
      const data = await RedisClient.zrangebyscore(
        this.METRICS_KEY,
        startTime,
        endTime
      );
      return data.map((item) => JSON.parse(item));
    } catch (error) {
      logger.error('Failed to retrieve usage metrics:', error);
      return [];
    }
  }

  static async getPopularEndpoints(
    timeRange: number = 3600
  ): Promise<Record<string, number>> {
    const startTime = Date.now() - timeRange * 1000;
    const metrics = await this.getMetrics(startTime, Date.now());

    return metrics.reduce(
      (acc, metric) => {
        const key = `${metric.method} ${metric.endpoint}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }
}
