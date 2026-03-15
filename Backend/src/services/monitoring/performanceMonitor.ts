import { Histogram, Gauge } from 'prom-client';
import logger from '../../utils/logger';

export class PerformanceMonitor {
  private static readonly requestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  private static readonly activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
  });

  private static readonly memoryUsage = new Gauge({
    name: 'memory_usage_bytes',
    help: 'Memory usage in bytes',
  });

  static trackRequest(
    method: string,
    route: string,
    duration: number,
    statusCode: number
  ) {
    this.requestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);
  }

  static updateConnections(count: number) {
    this.activeConnections.set(count);
  }

  static startMemoryMonitoring(interval = 60000) {
    setInterval(() => {
      const used = process.memoryUsage();
      this.memoryUsage.set(used.heapUsed);

      // Log if memory usage is high
      if (used.heapUsed > 1024 * 1024 * 1024) {
        // 1GB
        logger.warn('High memory usage detected', {
          heapUsed: used.heapUsed,
          heapTotal: used.heapTotal,
        });
      }
    }, interval);
  }
}
