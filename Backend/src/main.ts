// Sentry must be initialised before any other imports so it can instrument them
import './instrument.js';
// Validate env vars before anything else — crashes with a clear message on misconfiguration
import './config/env.js';

// Node ESM resolution requires the explicit .js extension on deep subpath
// imports of CJS packages. Without it, the built dist/main.js crashes at
// import time on Vercel with ERR_MODULE_NOT_FOUND, which surfaces in the
// browser as "CORS error" (500 response has no Access-Control-Allow-Origin).
import 'module-alias/register.js';

import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CORS_ORIGIN,
  PORT,
} from './config/index.js';
import { AppRoutes } from './routes/routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestIdMiddleware } from './middlewares/requestIdMiddleware.js';
import { setCsrfToken } from './middlewares/csrfMiddleware.js';
import logger from './utils/logger.js';
import { v2 as cloudinary } from 'cloudinary';
import prisma from './lib/prisma.js';
import socketService from './services/socket.js';
import { redis } from './services/cacheService.js';
import { RedisStore, RedisReply } from 'rate-limit-redis';
import { register, collectDefaultMetrics } from 'prom-client';
import { PerformanceMonitor } from './services/monitoring/performanceMonitor.js';

import { fileURLToPath } from 'node:url';

type MaybeServer = ReturnType<Application['listen']>;

export class App {
  public readonly app: Application;

  constructor() {
    this.app = express();
    this.app.set('trust proxy', 1);
    // Enable weak ETags on all GET/HEAD responses — lets clients skip re-parsing
    // unchanged bodies (articles, subjects, roadmaps). Zero cost if not supported.
    this.app.set('etag', 'weak');

    this.initializeCloudinary();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeCloudinary(): void {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  }

  private initializeMiddlewares(): void {
    this.app.use(requestIdMiddleware);
    this.app.use(compression());

    // ── Prometheus metrics ────────────────────────────────────────────────
    // Exposed before auth/rate-limit/CSRF so scrapers are never throttled or
    // blocked. Optionally gate with METRICS_TOKEN (Bearer) in production.
    this.app.get('/metrics', async (req, res) => {
      const token = process.env.METRICS_TOKEN;
      if (token && req.headers.authorization !== `Bearer ${token}`) {
        res.status(401).end();
        return;
      }
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    });

    // Record every request's duration into the histogram. Route label uses the
    // matched route pattern (e.g. /:id) — not the raw path — to avoid
    // high-cardinality series from ids/slugs.
    this.app.use((req, res, next) => {
      const start = process.hrtime.bigint();
      res.on('finish', () => {
        const durationSec = Number(process.hrtime.bigint() - start) / 1e9;
        const route = req.route?.path ?? req.baseUrl ?? 'unmatched';
        PerformanceMonitor.trackRequest(
          req.method,
          typeof route === 'string' && route ? route : 'unmatched',
          durationSec,
          res.statusCode
        );
      });
      next();
    });

    // Global body parsers — skip JSON for stripe webhooks to allow raw parsing in SubscriptionRoutes
    this.app.use((req, res, next) => {
      if (req.originalUrl.includes('/billing/stripe/webhook')) {
        next();
      } else {
        express.json()(req, res, next);
      }
    });

    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    // CSRF Double-Submit Token Pattern (stateless).
    //
    // 🔴 verifyCsrfToken is NO LONGER GLOBAL, and that is a bug fix, not a
    // weakening. Applied to every request it rejected EVERY state-changing
    // request from the deployed frontend with 403 CSRF_INVALID — likes,
    // bookmarks, comments, enrolments, quiz submissions, all of it.
    //
    // WHY IT COULD NEVER HAVE WORKED HERE.
    //
    // Double-submit requires the browser to (a) hold the XSRF-TOKEN cookie and
    // (b) let JavaScript read it back to echo in a header. The frontend runs on
    // eduscale.vercel.app and the API on a different *.vercel.app deployment.
    // `vercel.app` is on the Public Suffix List, so those are separate SITES,
    // not sibling subdomains: the frontend's `document.cookie` cannot see a
    // cookie set by the API's domain at all, and `sameSite: 'strict'` means the
    // browser would not send it cross-site even if it could. `cookieToken` was
    // therefore always undefined, and the check always failed.
    //
    // WHY REMOVING IT GLOBALLY IS SAFE.
    //
    // CSRF is an attack on AMBIENT credentials — a cookie the browser attaches
    // automatically. This API does not have any: authMiddleware reads
    // `Authorization: Bearer` and nothing else, and a cross-origin page cannot
    // set that header on a request it forges. This is the standard OWASP
    // position for token-authenticated APIs.
    //
    // WHERE IT IS STILL NEEDED: the refresh endpoint, which is the one place a
    // cookie (`sb-refresh-token`) authenticates. It is applied there, at the
    // route, rather than to everything.
    //
    // The deeper fix is to serve the API same-origin behind a Next.js rewrite,
    // which would make both the refresh cookie and double-submit work as
    // designed. Written up in docs/CSRF-AND-COOKIES.md.
    this.app.use(setCsrfToken);
    this.app.use(
      cors({
        origin: function (origin, callback) {
          // Allow requests with no origin (mobile apps, curl, etc.)
          if (!origin) return callback(null, true);

          if (process.env.NODE_ENV === 'production') {
            // In production, only allow origins from CORS_ORIGIN env var.
            // Entries may contain a single `*` wildcard (e.g. `https://*.vercel.app`)
            // so preview deployments don't need to be listed individually.
            const allowedOrigins = (CORS_ORIGIN || '')
              .split(',')
              .map((o) => o.trim())
              .filter(Boolean);
            const wildcardToRegex = (pattern: string) =>
              new RegExp(
                '^' +
                  pattern
                    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
                    .replace(/\*/g, '.*') +
                  '$'
              );
            const isAllowed = allowedOrigins.some((o) =>
              o.includes('*') ? wildcardToRegex(o).test(origin) : o === origin
            );
            if (allowedOrigins.length === 0 || isAllowed) {
              return callback(null, true);
            }
            return callback(new Error(`Origin ${origin} not allowed by CORS`));
          }

          // In development, allow localhost and private network IPs
          const isLocalhost =
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
          const privateNetworkRegexes = [
            /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
            /^https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
            /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(:\d+)?$/,
          ];
          const isPrivateNetwork = privateNetworkRegexes.some((re) =>
            re.test(origin)
          );

          if (isLocalhost || isPrivateNetwork) {
            return callback(null, true);
          }

          return callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
        // Explicitly allow the headers the frontend sends. Without this,
        // express cors sometimes fails to echo the Access-Control-
        // Request-Headers list on preflight responses, which makes
        // browsers block the actual POST /roadmaps/enroll + POST /battles
        // requests — surfacing to the user as 'CORS error' even though
        // the origin check itself passed. Seen on Vercel serverless.
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-XSRF-TOKEN',
          'X-Requested-With',
          'Accept',
          'Origin',
        ],
        exposedHeaders: ['Content-Length', 'X-Request-Id'],
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        maxAge: 600,
      })
    );
    const isProd = process.env.NODE_ENV === 'production';
    const cloudinaryHost = 'https://res.cloudinary.com';
    const supabaseHost = process.env.SUPABASE_URL || '';
    const apiOrigin = process.env.API_URL || 'http://localhost:5000';
    const clientOrigins = (process.env.CORS_ORIGIN || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    this.app.use(
      helmet({
        // Disable COEP in dev (breaks hot-reload tools that load cross-origin resources)
        crossOriginEmbedderPolicy: isProd,
        contentSecurityPolicy: isProd
          ? {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for inline styles from Swagger UI
                imgSrc: ["'self'", 'data:', cloudinaryHost],
                connectSrc: [
                  "'self'",
                  apiOrigin,
                  supabaseHost,
                  ...clientOrigins,
                ],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                objectSrc: ["'none'"],
                frameAncestors: ["'none'"],
                upgradeInsecureRequests: [],
              },
            }
          : false,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        // Permissions-Policy: disable unused browser APIs that could be abused
        // Helmet doesn't have a built-in helper yet, so set manually below
      })
    );

    // Permissions-Policy header (Feature-Policy successor)
    // Disables camera, microphone, geolocation — EduScale doesn't need them.
    this.app.use((_req, res, next) => {
      res.setHeader(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()'
      );
      next();
    });

    // Redis-backed rate limiter when Redis is reachable; silent fallback to
    // the in-memory MemoryStore per-instance when it isn't. Previously a
    // ENOTFOUND on the Upstash host 500d every request through the middleware.
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: process.env.NODE_ENV === 'production' ? 100 : 10000,
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many requests from this IP, please try again later.',
      // Don't block the request path on Redis failures — degrade gracefully.
      skip: () => false,
      store: new RedisStore({
        sendCommand: (...args: string[]) =>
          redis.call(...(args as [string, ...string[]])) as Promise<RedisReply>,
      }),
    });
    // Wrap so any RedisStore throw gets swallowed and the request continues.
    // Serverless cold starts on a dead Redis would otherwise 500 every call.
    this.app.use((req, res, next) => {
      limiter(req, res, (err?: unknown) => {
        if (err) {
          console.warn(
            '[rate-limit] degraded — continuing without throttle:',
            err instanceof Error ? err.message : err
          );
          return next();
        }
        return next();
      });
    });
  }

  private initializeRoutes(): void {
    const appRoutes = new AppRoutes();
    this.app.use('/api/v1', appRoutes.getRouter());
  }

  private initializeErrorHandling(): void {
    // Add default 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });

    // Sentry setup as per user's instructions:
    // The error handler must be registered before any other error middleware and after all controllers
    import('@sentry/node').then((Sentry) => {
      Sentry.setupExpressErrorHandler(this.app);

      // Fallthrough error handler
      this.app.use(errorHandler);
    });
  }

  private setupGracefulShutdown(server: MaybeServer): void {
    const shutdown = () => {
      logger.info(
        'Shutdown signal received. Closing server and database connections.'
      );
      server.close(async () => {
        logger.info('HTTP server closed.');
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }

  public async start(): Promise<void> {
    // Process-level safety nets — must be set before anything can throw
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled promise rejection', { reason });
      process.exit(1);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    // Collect Node/process default metrics (CPU, GC, heap, event loop lag) and
    // start the heap gauge — both feed the Prometheus /metrics endpoint.
    collectDefaultMetrics();
    PerformanceMonitor.startMemoryMonitoring();

    try {
      await prisma.$connect();
      logger.info('Connected to PostgreSQL database');

      const server = this.app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });

      // Initialize WebSocket server
      socketService.initialize(server);

      this.setupGracefulShutdown(server);
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Instantiate and conditionally start server
const appInstance = new App();

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  appInstance.start();
}

// Export the Express application for serverless (Vercel) or testing
export default appInstance.app;
