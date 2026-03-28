import { Request, Response } from 'express';
import { AxiosError } from 'axios';
import logger from '../utils/logger';
import { DatabaseError } from '../types/errors';

// Custom error interface
interface AppError extends Error {
  status?: number;
  code?: string;
  data?: unknown;
}

// Error response interface
interface ErrorResponse {
  success: boolean;
  message: string;
  error?: unknown;
  stack?: string;
  code?: string;
  data?: unknown;
}

// Error codes mapping
const ERROR_CODES = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error messages mapping
const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation Error',
  UNAUTHORIZED: 'Unauthorized Access',
  FORBIDDEN: 'Forbidden Access',
  NOT_FOUND: 'Resource Not Found',
  CONFLICT: 'Resource Conflict',
  INTERNAL_SERVER: 'Internal Server Error',
  SERVICE_UNAVAILABLE: 'Service Temporarily Unavailable',
  DATABASE_ERROR: 'Database Error Occurred',
  UNKNOWN_ERROR: 'Something Went Wrong',
} as const;

/**
 * Creates a formatted error response
 */
const createErrorResponse = (error: AppError, req: Request): ErrorResponse => {
  const response: ErrorResponse = {
    success: false,
    message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    error: error.name,
    code: error.code,
    data: error.data,
  };

  // Include stack trace in development environment
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  // Log error details
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  return response;
};

/**
 * Main error handling middleware
 */
const errorMiddleware = async (
  error: AppError,
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let statusCode = error.status || ERROR_CODES.INTERNAL_SERVER;

    // Handle different types of errors
    if (error instanceof DatabaseError) {
      statusCode = ERROR_CODES.SERVICE_UNAVAILABLE;
      error.message = ERROR_MESSAGES.DATABASE_ERROR;
    } else if (error instanceof AxiosError) {
      statusCode = error.response?.status || ERROR_CODES.SERVICE_UNAVAILABLE;
    } else if (error.name === 'ValidationError') {
      statusCode = ERROR_CODES.VALIDATION_ERROR;
    }

    // Create and send error response
    const errorResponse = createErrorResponse(error, req);
    res.status(statusCode).json(errorResponse);
  } catch (err) {
    logger.error('Error in error middleware:', err);
    res.status(ERROR_CODES.INTERNAL_SERVER).json({
      success: false,
      message: ERROR_MESSAGES.UNKNOWN_ERROR,
    });
  }
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = (error: Error): void => {
  logger.error('Unhandled Rejection:', error);
  // Graceful shutdown after logging
  process.exit(1);
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = (error: Error): void => {
  logger.error('Uncaught Exception:', error);
  // Graceful shutdown after logging
  process.exit(1);
};

/**
 * Graceful shutdown handler
 */
const handleGracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  try {
    logger.info('Graceful shutdown completed.');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Register process handlers
process.on('unhandledRejection', handleUnhandledRejection);
process.on('uncaughtException', handleUncaughtException);
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

// Not found middleware
export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(ERROR_CODES.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

export default errorMiddleware;
