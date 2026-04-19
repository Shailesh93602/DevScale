import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Proper AppError interface and implementation
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
}

export const errorHandler: ErrorRequestHandler = (
  err: ErrorWithStatusCode,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  void next;
  // Structured logging with logger
  if (err instanceof AppError) {
    logger.error('Application Error', {
      status: err.statusCode,
      path: `${req.method} ${req.originalUrl}`,
      message: err.message,
      details: err.details,
      stack: err.stack,
    });
  } else {
    logger.error('Unexpected Error', {
      status: 500,
      path: `${req.method} ${req.originalUrl}`,
      message: err.message,
      stack: err.stack,
    });
  }

  // Error response handling
  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';
  const message =
    statusCode === 500 && !isDev ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    status: statusCode,
    message,
    error: true,
    toast: statusCode < 500,
    requestId: req.requestId,
    ...(isDev && { stack: err.stack }),
  });
};

// Utility function to create errors
export const createAppError = (
  message: string,
  statusCode: number,
  details?: Record<string, unknown>
) => new AppError(message, statusCode, details);
