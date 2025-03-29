import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CORS_ORIGIN,
  PORT,
} from './config';
import { AppRoutes } from './routes/routes';
import { errorHandler } from './middlewares/errorHandler';
import logger from './utils/logger';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

export class App {
  private readonly app: Application;
  private readonly prisma: PrismaClient;

  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
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
    this.app.use(helmet());
    this.app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
      })
    );
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
    this.app.use(cookieParser());
    this.app.use(
      cors({
        origin: CORS_ORIGIN,
        credentials: true,
      })
    );
  }

  private initializeRoutes(): void {
    const appRoutes = new AppRoutes();
    this.app.use('/api/v1', appRoutes.getRouter());
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('Connected to PostgreSQL database');

      const server = this.app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });

      this.setupGracefulShutdown(server);
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(server: any): void {
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received: closing server`);
      server.close(async () => {
        await this.prisma.$disconnect();
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled Rejection:', error);
      process.exit(1);
    });
  }
}

const app = new App();
app.start();

export default app;
