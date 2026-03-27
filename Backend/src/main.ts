// Sentry must be initialised before any other imports so it can instrument them
import '../instrument';

import 'module-alias/register';

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
} from './config';
import { AppRoutes } from './routes/routes';
import { errorHandler } from './middlewares/errorHandler';
import { requestIdMiddleware } from './middlewares/requestIdMiddleware';
import logger from './utils/logger';
import { v2 as cloudinary } from 'cloudinary';
import prisma from './lib/prisma';
import socketService from './services/socket';
import { redis } from './services/cacheService';
import { RedisStore } from 'rate-limit-redis';

declare const require: NodeRequire;

type MaybeServer = ReturnType<Application['listen']>;

export class App {
  public readonly app: Application;

  constructor() {
    this.app = express();
    this.app.set('trust proxy', 1);
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
    this.app.use(requestIdMiddleware); // Must be first — stamps every request with a requestId
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(
      cors({
        origin: function (origin, callback) {
          // Allow requests with no origin (mobile apps, curl, etc.)
          if (!origin) return callback(null, true);

          if (process.env.NODE_ENV === 'production') {
            // In production, only allow origins from CORS_ORIGIN env var
            const allowedOrigins = (CORS_ORIGIN || '')
              .split(',')
              .map((o) => o.trim())
              .filter(Boolean);
            if (
              allowedOrigins.length === 0 ||
              allowedOrigins.includes(origin)
            ) {
              return callback(null, true);
            }
            return callback(
              new Error(`Origin ${origin} not allowed by CORS`)
            );
          }

          // In development, allow localhost and private network IPs
          const isLocalhost =
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
          const isPrivateNetwork =
            /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
              origin
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
      })
    );

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: process.env.NODE_ENV === 'production' ? 100 : 10000,
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many requests from this IP, please try again later.',
      store: new RedisStore({
        sendCommand: (...args: string[]) => redis.call(...args as [string, ...string[]]),
      }),
    });
    this.app.use(limiter);
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

    // Add existing error handler
    this.app.use(errorHandler);
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
      logger.error('Uncaught exception', { error: error.message, stack: error.stack });
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

if (require.main === module) {
  appInstance.start();
}

// Export the Express application for serverless (Vercel) or testing
export default appInstance.app;
