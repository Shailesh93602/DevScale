import { RedisClient } from '../redis';
import logger from '../../utils/logger';
import { AlertService } from './alertService';

interface ErrorRecord {
  message: string;
  stack?: string;
  timestamp: number;
  count: number;
  lastOccurrence: number;
  metadata?: Record<string, unknown>;
}

interface ErrorAlert {
  type: string;
  message: string;
  level: 'low' | 'medium' | 'high';
  data?: Record<string, unknown>;
}

export class ErrorTracker {
  private static readonly ERROR_KEY_PREFIX = 'error:';
  private static readonly ERROR_TTL = 24 * 60 * 60; // 24 hours

  static async trackError(error: Error, metadata?: Record<string, unknown>) {
    const errorKey = `${this.ERROR_KEY_PREFIX}${error.message}`;

    try {
      const existingError = await RedisClient.get(errorKey);
      const errorRecord: ErrorRecord = existingError
        ? JSON.parse(existingError)
        : {
            message: error.message,
            stack: error.stack,
            timestamp: Date.now(),
            count: 0,
            lastOccurrence: Date.now(),
            metadata,
          };

      errorRecord.count++;
      errorRecord.lastOccurrence = Date.now();

      await RedisClient.setex(
        errorKey,
        this.ERROR_TTL,
        JSON.stringify(errorRecord)
      );

      // Alert if error frequency is high
      if (errorRecord.count > 10) {
        await AlertService.sendAlert('error_frequency', {
          type: 'error_frequency',
          message: `Error "${errorRecord.message}" occurred ${errorRecord.count} times`,
          level: 'high',
          data: { errorRecord },
        } as ErrorAlert);
      }

      logger.error('Error tracked:', errorRecord);
    } catch (trackingError) {
      logger.error('Error tracking failed:', trackingError);
    }
  }

  static async getErrorStats(timeRange: number = 3600): Promise<ErrorRecord[]> {
    const errors: ErrorRecord[] = [];
    const keys = await RedisClient.keys(`${this.ERROR_KEY_PREFIX}*`);

    for (const key of keys) {
      const errorData = await RedisClient.get(key);
      if (errorData) {
        const error = JSON.parse(errorData);
        if (Date.now() - error.lastOccurrence <= timeRange * 1000) {
          errors.push(error);
        }
      }
    }

    return errors;
  }
}
