import { Response } from 'express';
import logger from './logger';
/* eslint-disable @typescript-eslint/no-explicit-any */
interface ResponsePayload {
  data?: any;
  message?: string;
  status?: number;
  toast?: boolean;
  error?: boolean;
  meta?: Record<string, any>;
}

interface ResponseMessage {
  statusCode: number;
  defaultMessage: string;
  toast?: boolean;
  error?: boolean;
}

const messages: Record<string, ResponseMessage> = {
  // Success Messages
  SUCCESS: { statusCode: 200, defaultMessage: 'Request successful' },
  CREATED: { statusCode: 201, defaultMessage: 'Resource created successfully' },

  // Error Messages
  BAD_REQUEST: {
    statusCode: 400,
    defaultMessage: 'Invalid request',
    error: true,
    toast: true,
  },
  UNAUTHORIZED: {
    statusCode: 401,
    defaultMessage: 'Authentication required',
    error: true,
    toast: true,
  },
  FORBIDDEN: {
    statusCode: 403,
    defaultMessage: 'Permission denied',
    error: true,
    toast: true,
  },
  NOT_FOUND: {
    statusCode: 404,
    defaultMessage: 'Resource not found',
    error: true,
    toast: true,
  },
  CONFLICT: {
    statusCode: 409,
    defaultMessage: 'Resource conflict',
    error: true,
    toast: true,
  },
  SERVER_ERROR: {
    statusCode: 500,
    defaultMessage: 'Internal server error',
    error: true,
    toast: false,
  },

  // Custom Messages
  USER_CREATED: {
    statusCode: 201,
    defaultMessage: 'User registered successfully',
    toast: true,
  },
  LOGIN_SUCCESS: {
    statusCode: 200,
    defaultMessage: 'Logged in successfully',
    toast: true,
  },
  USER_SYNCED: {
    statusCode: 200,
    defaultMessage: 'User profile synchronized',
    toast: true,
  },
  EMAIL_VERIFIED: {
    statusCode: 200,
    defaultMessage: 'Email verified successfully',
    toast: true,
  },
  NOT_CREATED: {
    statusCode: 201,
    defaultMessage: 'User not created',
    toast: false,
    error: false,
  },
};

export const sendResponse = (
  res: Response,
  messageKey: keyof typeof messages,
  options?: Partial<ResponsePayload>
) => {
  const messageConfig = messages[messageKey];
  if (!messageConfig) {
    throw new Error(`Invalid message key: ${messageKey}`);
  }

  const response: ResponsePayload = {
    status: messageConfig.statusCode,
    message: options?.message || messageConfig.defaultMessage,
    toast: messageConfig.toast,
    error: messageConfig.error,
    data: options?.data,
    meta: options?.meta,
  };

  // Filter out undefined values
  const filteredResponse = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(response).filter(([key, value]) => value !== undefined)
  );

  res.status(messageConfig.statusCode).json(filteredResponse);
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

  res.status(statusCode as number).json({
    status: statusCode,
    message,
    error: true,
    toast: statusCode < 500,
  });
};
