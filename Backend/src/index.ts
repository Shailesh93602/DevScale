import express from 'express';
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
import routes from './routes/routes';
import { errorHandler } from './middlewares/errorHandler';
import { applyPassportStrategy } from './middlewares/passport';
import logger from './utils/logger';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  })
);

// Body Parser Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

// Passport Configuration
applyPassportStrategy();

// Routes
app.use('/api/v1', routes);

// Error Handler
app.use(errorHandler);

const startServer = async () => {
  try {
    // Database Connection Check
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database');

    // Server Startup
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received: closing server`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Start the application
startServer();

export default app;
