"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppError = exports.errorHandler = exports.AppError = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = __importDefault(require("../utils/logger"));
// Proper AppError interface and implementation
class AppError extends Error {
    message;
    statusCode;
    details;
    constructor(message, statusCode = 500, details) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, _next) => {
    // Structured logging with logger
    if (err instanceof AppError) {
        logger_1.default.error('Application Error', {
            status: err.statusCode,
            path: `${req.method} ${req.originalUrl}`,
            message: err.message,
            details: err.details,
            stack: err.stack,
        });
    }
    else {
        logger_1.default.error('Unexpected Error', {
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
    (0, apiResponse_1.sendError)(res, errorResponse);
};
exports.errorHandler = errorHandler;
// Utility function to create errors
const createAppError = (message, statusCode, details) => new AppError(message, statusCode, details);
exports.createAppError = createAppError;
//# sourceMappingURL=errorHandler.js.map