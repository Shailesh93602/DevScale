"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendResponse = void 0;
const logger_1 = __importDefault(require("./logger"));
const messages = {
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
};
const sendResponse = (res, messageKey, options) => {
    const messageConfig = messages[messageKey];
    if (!messageConfig) {
        throw new Error(`Invalid message key: ${messageKey}`);
    }
    const response = {
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
    Object.entries(response).filter(([key, value]) => value !== undefined));
    res.status(messageConfig.statusCode).json(filteredResponse);
};
exports.sendResponse = sendResponse;
// Add type guard for error object
const isAppError = (error) => {
    return error instanceof Error && 'statusCode' in error;
};
const sendError = (res, error) => {
    logger_1.default.error(error);
    const statusCode = isAppError(error) ? error.statusCode : 500;
    const message = isAppError(error) ? error.message : 'Internal server error';
    res.status(statusCode).json({
        status: statusCode,
        message,
        error: true,
        toast: statusCode < 500,
    });
};
exports.sendError = sendError;
//# sourceMappingURL=apiResponse.js.map