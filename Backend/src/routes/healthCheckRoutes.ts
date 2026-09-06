import { BaseRouter } from './BaseRouter';
import { resolveRuntimeMode } from '../config/runtimeMode';
import prisma from '../lib/prisma';
import { redis } from '../services/cacheService';
import Queue from 'bull';
import { REDIS_URL } from '../config';
import { APP_COMMIT_HEADER, resolveAppVersion } from '../utils/appVersion';

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

      // The EFFECTIVE mode, not the raw NODE_ENV. Reporting the raw value is
      // how a production host ran unhardened while this endpoint said
      // "development" and no check treated that as a failure.
      const mode = resolveRuntimeMode();

      // Which build answered — so a checker can compare live against main
      // instead of trusting a 200 from a deploy that stopped updating. Also
      // sent as a header, for callers that do not want to parse the body.
      const version = resolveAppVersion();
      res.setHeader(APP_COMMIT_HEADER, version.sha);
      res.status(httpStatus).json({
        status: httpStatus === 200 ? 'ok' : 'degraded',
        environment: mode.isProduction
          ? 'production'
          : (mode.nodeEnv ?? 'development'),
        // Present ONLY when the platform says production and NODE_ENV does
        // not. The server is hardened either way; this makes the
        // misconfiguration visible to a checker instead of silent.
        ...(mode.nodeEnvMismatch
          ? {
              nodeEnvMismatch: {
                nodeEnv: mode.nodeEnv ?? null,
                platformEnv: mode.platformEnv ?? null,
              },
            }
          : {}),
        timestamp: new Date().toISOString(),
        checks,
        version,
      });
    });
  }
}

export default new HealthCheckRoutes().getRouter();
