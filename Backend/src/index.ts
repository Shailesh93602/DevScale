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
import prisma from './lib/prisma';

export class App {
  private readonly app: Application;

  constructor() {
    this.app = express();
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
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(
      cors({
        origin: CORS_ORIGIN,
        credentials: true,
      })
    );
    this.app.use(helmet());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
    });
    this.app.use(limiter);
  }

  private initializeRoutes(): void {
    const appRoutes = new AppRoutes();
    this.app.use('/api/v1', appRoutes.getRouter());
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private setupGracefulShutdown(server: any): void {
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received.');
      server.close(async () => {
        logger.info('HTTP server closed.');
        await prisma.$disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received.');
      server.close(async () => {
        logger.info('HTTP server closed.');
        await prisma.$disconnect();
        process.exit(0);
      });
    });
  }

  public async start(): Promise<void> {
    try {
      await prisma.$connect();
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
}

const app = new App();
app.start();

export default app;
