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
  // Structured logging with logger.
  //
  // `instanceof AppError` used to be the branch condition, but the errors this
  // app actually throws come from utils/errorHandler.createAppError, which
  // builds a plain Error with a `statusCode` property — a different type from
  // the class declared here. So the check was always false and EVERY handled
  // 401/403/404/422 was logged at error level as "Unexpected Error" with
  // status 500, burying real 500s in Sentry. Branch on the status instead, and
  // log expected client errors at warn.
  const statusCode = err.statusCode || 500;
  const isHandled =
    err instanceof AppError || typeof err.statusCode === 'number';
  const logPayload = {
    status: statusCode,
    path: `${req.method} ${req.originalUrl}`,
    message: err.message,
    details: (err as AppError).details,
    stack: err.stack,
  };
  if (isHandled && statusCode < 500) {
    logger.warn('Client Error', logPayload);
  } else if (isHandled) {
    logger.error('Application Error', logPayload);
  } else {
    logger.error('Unexpected Error', logPayload);
  }

  // Error response handling
  const isDev = process.env.NODE_ENV === 'development';
  const message =
    statusCode === 500 && !isDev ? 'Internal server error' : err.message;

  // `details` reaches the client only for handled CLIENT errors. It is where a
  // machine-readable code lives (e.g. AI_KEY_REQUIRED, which tells the UI to
  // offer a link to Settings rather than just printing a sentence). Withheld on
  // 5xx for the same reason the message is: an unhandled server error's details
  // are internal state, and this is the one place that distinction gets made.
  const details = (err as AppError).details;
  res.status(statusCode).json({
    status: statusCode,
    message,
    error: true,
    toast: statusCode < 500,
    requestId: req.requestId,
    ...(isHandled && statusCode < 500 && details ? { details } : {}),
    ...(isDev && { stack: err.stack }),
  });
};

// Utility function to create errors
export const createAppError = (
  message: string,
  statusCode: number,
  details?: Record<string, unknown>
) => new AppError(message, statusCode, details);
