import { RedisClient } from '../redis';
import logger from '../../utils/logger';
import { sendEmail } from '../email';

interface AlertConfig {
  type: string;
  threshold: number;
  interval: number;
  channels: string[];
  enabled: boolean;
}

interface Alert {
  type: string;
  message: string;
  level: 'low' | 'medium' | 'high';
  timestamp: number;
  data?: Record<string, unknown>;
}

export class AlertService {
  private static readonly ALERT_CONFIG_KEY = 'alert_config';
  private static readonly ALERT_HISTORY_KEY = 'alert_history';

  static async configure(config: AlertConfig) {
    try {
      await RedisClient.hset(
        this.ALERT_CONFIG_KEY,
        config.type,
        JSON.stringify(config)
      );
      logger.info('Alert configuration updated:', config);
    } catch (error) {
      logger.error('Failed to update alert configuration:', error);
      throw error;
    }
  }

  static async sendAlert(type: string, data: Omit<Alert, 'timestamp'>) {
    try {
      const config = await this.getConfig(type);
      if (!config?.enabled) return;

      const alert: Alert = {
        ...data,
        type,
        timestamp: Date.now(),
      };

      // Store alert in history
      await RedisClient.zadd(
        this.ALERT_HISTORY_KEY,
        alert.timestamp,
        JSON.stringify(alert)
      );

      // Send notifications based on configured channels
      for (const channel of config.channels) {
        switch (channel) {
          case 'email':
            await this.sendEmailAlert(alert);
            break;
          case 'slack':
            await this.sendSlackAlert(alert);
            break;
          default:
            logger.warn('Unknown alert channel:', channel);
        }
      }

      logger.info('Alert sent:', alert);
    } catch (error) {
      logger.error('Failed to send alert:', error);
    }
  }

  private static async getConfig(type: string): Promise<AlertConfig | null> {
    const config = await RedisClient.hget(this.ALERT_CONFIG_KEY, type);
    return config ? JSON.parse(config) : null;
  }

  private static async sendEmailAlert(alert: Alert) {
    await sendEmail({
      subject: `Alert: ${alert.type}`,
      text: `${alert.message}\nLevel: ${alert.level}\nTimestamp: ${new Date(
        alert.timestamp
      ).toISOString()}`,
      to: process.env.ALERT_EMAIL!,
    });
  }

  private static async sendSlackAlert(alert: Alert) {
    // Implement Slack notification
    logger.info('Slack alert would be sent:', alert);
  }
}
