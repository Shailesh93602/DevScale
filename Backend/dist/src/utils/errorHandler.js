"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppError = exports.errorHandler = void 0;
const apiResponse_1 = require("./apiResponse");
const logger_1 = __importDefault(require("./logger"));
const errorHandler = (err, req, res) => {
    logger_1.default.error(err.message, {
        stack: err.stack,
        path: req.path,
        method: req.method,
        status: err.statusCode || 500,
    });
    // Handle known errors
    if (err.statusCode && err.statusCode < 500) {
        return (0, apiResponse_1.sendError)(res, {
            message: err.message,
            statusCode: err.statusCode,
            details: err.details,
            name: err.name,
        });
    }
    // Handle unknown errors
    (0, apiResponse_1.sendError)(res, {
        message: 'Internal server error',
        statusCode: 500,
        name: 'InternalServerError',
    });
};
exports.errorHandler = errorHandler;
const createAppError = (message, statusCode, details) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.details = details;
    error.name = 'AppError';
    return error;
};
exports.createAppError = createAppError;
//# sourceMappingURL=errorHandler.js.map