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
import { setCsrfToken, verifyCsrfToken } from './middlewares/csrfMiddleware.js';
import logger from './utils/logger.js';
import { v2 as cloudinary } from 'cloudinary';
import prisma from './lib/prisma.js';
import socketService from './services/socket.js';
import { redis } from './services/cacheService.js';
import { RedisStore, RedisReply } from 'rate-limit-redis';

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
    // CSRF Double-Submit Token Pattern (stateless)
    // - setCsrfToken ensures the XSRF-TOKEN cookie exists
    // - verifyCsrfToken validates the X-XSRF-TOKEN header for POST/PUT/DELETE
    this.app.use(setCsrfToken);
    this.app.use(verifyCsrfToken);
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
