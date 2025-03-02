"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendResponse = void 0;
const logger_1 = __importDefault(require("./logger"));
const RESPONSE_MESSAGES = {
    TOPICS_FETCHED: {
        status: 200,
        success: true,
        message: 'Unpublished topics retrieved successfully',
    },
    TOPIC_NOT_FOUND: {
        status: 404,
        success: false,
        message: 'Topic not found',
    },
    ARTICLE_FETCHED: {
        status: 200,
        success: true,
        message: 'Article retrieved successfully',
    },
    ARTICLE_NOT_FOUND: {
        status: 404,
        success: false,
        message: 'Article not found',
    },
    ARTICLES_FETCHED: {
        status: 200,
        success: true,
        message: 'Articles retrieved successfully',
    },
    QUIZ_FETCHED: {
        status: 200,
        success: true,
        message: 'Quiz retrieved successfully',
    },
    QUIZ_NOT_FOUND: {
        status: 404,
        success: false,
        message: 'Quiz not found',
    },
    QUIZ_SUBMITTED: {
        status: 200,
        success: true,
        message: 'Quiz submitted successfully',
    },
    QUIZ_PASSED: {
        status: 200,
        success: true,
        message: 'Quiz passed!',
    },
    QUIZ_FAILED: {
        status: 200,
        success: false,
        message: 'Quiz failed',
    },
    SUBJECTS_FETCHED: {
        status: 200,
        success: true,
        message: 'Subjects retrieved successfully',
    },
    SUBJECT_NOT_FOUND: {
        status: 404,
        success: false,
        message: 'Subject not found',
    },
    TOPICS_NOT_FOUND: {
        status: 404,
        success: false,
        message: 'Topic not found',
    },
    USER_NOT_CREATED: {
        status: 500,
        success: false,
        message: 'User not created',
    },
    PROFILE_FETCHED: {
        status: 200,
        success: true,
        message: 'Profile retrieved successfully',
    },
    PROGRESS_FETCHED: {
        status: 200,
        success: true,
        message: 'Progress retrieved successfully',
    },
    USER_CREATED: {
        status: 201,
        success: true,
        message: 'User created successfully',
    },
    USER_UPDATED: {
        status: 200,
        success: true,
        message: 'User updated successfully',
    },
    USERNAME_CHECKED: {
        status: 200,
        success: true,
        message: 'Username checked successfully',
    },
};
const sendResponse = (res, type, options) => {
    const config = RESPONSE_MESSAGES[type];
    return res.status(config.status).json({
        success: config.success,
        message: config.message,
        data: options?.data || null,
        error: options?.error || null,
        meta: options?.meta || null,
    });
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