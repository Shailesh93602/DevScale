import { ErrorRequestHandler, Request, Response } from 'express';
import { sendError } from './apiResponse';
import logger from './logger';

export interface AppError extends Error {
  statusCode: number;
  details?: Record<string, unknown>;
}

export const errorHandler: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response
) => {
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    status: err.statusCode || 500,
  });

  // Handle known errors
  if (err.statusCode && err.statusCode < 500) {
    return sendError(res, {
      message: err.message,
      statusCode: err.statusCode,
      details: err.details,
      name: err.name,
    } as AppError);
  }

  // Handle unknown errors
  sendError(res, {
    message: 'Internal server error',
    statusCode: 500,
    name: 'InternalServerError',
  } as AppError);
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
