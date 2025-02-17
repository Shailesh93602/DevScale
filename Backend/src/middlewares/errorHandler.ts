import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import logger from '../utils/logger';

// Export the AppError interface
export interface AppError extends Error {
  statusCode: number;
  details?: Record<string, unknown>;
}

export const errorHandler: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    status: err.statusCode || 500,
  });

  // Handle operational errors
  if (err.statusCode && err.statusCode < 500) {
    return sendError(res, {
      message: err.message,
      name: err.name,
    });
  }

  // Handle unexpected errors
  if (!res.headersSent) {
    sendError(res, {
      message: 'Internal server error',
      statusCode: 500,
      name: 'InternalServerError',
    } as AppError);
  }
};

export const createAppError = (
  message: string,
  statusCode: number,
  details?: Record<string, unknown>
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.details = details;
  error.name = 'AppError';
  return error;
};
