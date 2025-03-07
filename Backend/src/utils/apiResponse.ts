import { Response } from 'express';
import logger from './logger';
/* eslint-disable @typescript-eslint/no-explicit-any */

type ResponseType =
  | 'TOPICS_FETCHED'
  | 'TOPIC_NOT_FOUND'
  | 'ARTICLE_FETCHED'
  | 'ARTICLE_NOT_FOUND'
  | 'ARTICLES_FETCHED'
  | 'QUIZ_FETCHED'
  | 'QUIZ_NOT_FOUND'
  | 'QUIZ_SUBMITTED'
  | 'QUIZ_PASSED'
  | 'QUIZ_FAILED'
  | 'SUBJECTS_FETCHED'
  | 'TOPICS_NOT_FOUND'
  | 'SUBJECT_NOT_FOUND'
  | 'USER_NOT_CREATED'
  | 'PROFILE_FETCHED'
  | 'PROGRESS_FETCHED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USERNAME_CHECKED'
  | 'INVALID_PAGE_NUMBER'
  | 'ROADMAPS_FETCHED'
  | 'MAIN_CONCEPTS_FETCHED'
  | 'ROADMAP_NOT_FOUND'
  | 'ROADMAP_ENROLLED'
  | 'INVALID_ROADMAP_ID'
  | 'ROADMAP_ALREADY_ENROLLED';

interface ResponseConfig {
  status: number;
  success: boolean;
  message: string;
}

const RESPONSE_MESSAGES: Record<ResponseType, ResponseConfig> = {
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
  INVALID_PAGE_NUMBER: {
    status: 400,
    success: false,
    message: 'Invalid page number',
  },
  ROADMAPS_FETCHED: {
    status: 200,
    success: true,
    message: 'Roadmaps retrieved successfully',
  },
  MAIN_CONCEPTS_FETCHED: {
    status: 200,
    success: true,
    message: 'Main concepts retrieved successfully',
  },
  ROADMAP_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Roadmap not found',
  },
  ROADMAP_ENROLLED: {
    status: 200,
    success: true,
    message: 'Roadmap enrolled successfully',
  },
  INVALID_ROADMAP_ID: {
    status: 400,
    success: false,
    message: 'Invalid roadmap ID',
  },
  ROADMAP_ALREADY_ENROLLED: {
    status: 200,
    success: true,
    message: 'Roadmap already enrolled',
  },
};

export const sendResponse = (
  res: Response,
  type: ResponseType,
  options?: {
    data?: any;
    error?: any;
    meta?: any;
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
