import { BaseRouter } from './BaseRouter';
import { NODE_ENV } from '../config';
import prisma from '../lib/prisma';
import { redis } from '../services/cacheService';
import Queue from 'bull';
import { REDIS_URL } from '../config';

export class HealthCheckRoutes extends BaseRouter {
  protected initializeRoutes(): void {
    this.router.get('/', async (req, res) => {
      const checks: Record<string, 'ok' | 'error'> = {};
      let httpStatus = 200;

      // PostgreSQL check
      try {
        await prisma.$queryRaw`SELECT 1`;
        checks.postgres = 'ok';
      } catch {
        checks.postgres = 'error';
        httpStatus = 503;
      }

      // Redis check
      try {
        const pong = await redis.ping();
        checks.redis = pong === 'PONG' ? 'ok' : 'error';
        if (checks.redis === 'error') httpStatus = 503;
      } catch {
        checks.redis = 'error';
        httpStatus = 503;
      }

      // Bull queue check
      try {
        const q = new Queue('health-check-probe', REDIS_URL);
        await q.isReady();
        await q.close();
        checks.queue = 'ok';
      } catch {
        checks.queue = 'error';
        httpStatus = 503;
      }

      res.status(httpStatus).json({
        status: httpStatus === 200 ? 'ok' : 'degraded',
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
        checks,
      });
    });
  }
}

export default new HealthCheckRoutes().getRouter();
