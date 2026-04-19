import { BaseRouter } from './BaseRouter';
import { NODE_ENV } from '../config';
import prisma from '../lib/prisma';
import { redis } from '../services/cacheService';
import Queue from 'bull';
import { REDIS_URL } from '../config';

export class HealthCheckRoutes extends BaseRouter {
  protected initializeRoutes(): void {
    /**
     * GET /api/v1/ready
     * Liveness probe — returns 200 as soon as the process is up.
     * Does NOT check DB/Redis (that's /health). Used by ECS/K8s to know
     * when the container is ready to receive traffic.
     */
    this.router.get('/ready', (_req, res) => {
      res
        .status(200)
        .json({ status: 'ready', timestamp: new Date().toISOString() });
    });

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
