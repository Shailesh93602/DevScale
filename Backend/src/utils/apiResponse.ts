import { Response } from 'express';
import logger from './logger.js';
import {
  RESPONSE_MESSAGES,
  type ResponseType,
} from './responseMessages/index.js';

export const sendResponse = (
  res: Response,
  type: ResponseType,
  options?: {
    data?: unknown;
    error?: unknown;
    meta?: unknown;
  }
) => {
  const config = RESPONSE_MESSAGES[type];
  return res.status(config.status).json({
    success: config.success,
    message: config.message,
    data: options?.data || null,
    error: options?.error || null,
    meta: options?.meta || null,
  });
};

// Add type guard for error object
const isAppError = (
  error: unknown
): error is { statusCode: number; message: string } => {
  return error instanceof Error && 'statusCode' in error;
};

export const sendError = (res: Response, error: Error) => {
  logger.error(error);

  const statusCode = isAppError(error) ? error.statusCode : 500;
  const message = isAppError(error) ? error.message : 'Internal server error';

  res.status(statusCode).json({
    status: statusCode,
    message,
    error: true,
    toast: statusCode < 500,
  });
};
