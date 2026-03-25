import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
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
  _next: NextFunction
) => {
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
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  // Create a proper Error object
  const errorResponse = new Error(message);
  errorResponse.name = err.name || 'AppError';
  Object.assign(errorResponse, {
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });

  sendError(res, errorResponse);
};

// Utility function to create errors
export const createAppError = (
  message: string,
  statusCode: number,
  details?: Record<string, unknown>
) => new AppError(message, statusCode, details);
