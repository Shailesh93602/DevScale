import { Response } from 'express';
import logger from './logger';
/* eslint-disable @typescript-eslint/no-explicit-any */

export type ResponseType =
  | 'TOPICS_FETCHED'
  | 'TOPIC_NOT_FOUND'
  | 'ARTICLE_FETCHED'
  | 'ARTICLE_NOT_FOUND'
  | 'ARTICLE_CREATED'
  | 'ARTICLE_UPDATED'
  | 'ARTICLE_DELETED'
  | 'ARTICLE_LIKED'
  | 'ARTICLE_UNLIKED'
  | 'ARTICLE_BOOKMARKED'
  | 'ARTICLE_UNBOOKMARKED'
  | 'ARTICLE_COMMENTED'
  | 'COMMENT_DELETED'
  | 'COMMENT_UPDATED'
  | 'COMMENT_LIKED'
  | 'COMMENT_UNLIKED'
  | 'COMMENT_REPLIED'
  | 'COMMENT_REPLY_DELETED'
  | 'COMMENT_REPLY_UPDATED'
  | 'COMMENT_REPLY_LIKED'
  | 'COMMENT_REPLY_UNLIKED'
  | 'USER_PROFILE_FETCHED'
  | 'USER_PROFILE_UPDATED'
  | 'USER_ARTICLES_FETCHED'
  | 'USER_BOOKMARKS_FETCHED'
  | 'USER_LIKES_FETCHED'
  | 'USER_COMMENTS_FETCHED'
  | 'USER_REPLIES_FETCHED'
  | 'USER_NOTIFICATIONS_FETCHED'
  | 'USER_NOTIFICATION_READ'
  | 'USER_NOTIFICATION_DELETED'
  | 'USER_NOTIFICATION_CLEARED'
  | 'USER_SETTINGS_FETCHED'
  | 'USER_SETTINGS_UPDATED'
  | 'USER_PASSWORD_UPDATED'
  | 'USER_EMAIL_UPDATED'
  | 'USER_DELETED'
  | 'USER_LOGGED_OUT'
  | 'USER_LOGGED_IN'
  | 'USER_REGISTERED'
  | 'USER_VERIFIED'
  | 'USER_PASSWORD_RESET'
  | 'USER_PASSWORD_RESET_REQUESTED'
  | 'USER_EMAIL_VERIFICATION_SENT'
  | 'USER_EMAIL_VERIFICATION_RESENT'
  | 'USER_EMAIL_VERIFICATION_FAILED'
  | 'USER_PASSWORD_RESET_FAILED'
  | 'USER_LOGIN_FAILED'
  | 'USER_REGISTRATION_FAILED'
  | 'USER_VERIFICATION_FAILED'
  | 'INVALID_TOKEN'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_EMAIL'
  | 'INVALID_PASSWORD'
  | 'INVALID_CODE'
  | 'INVALID_PAYLOAD'
  | 'INVALID_REQUEST'
  | 'INVALID_RESPONSE'
  | 'INVALID_STATE'
  | 'INVALID_STATUS'
  | 'INVALID_TYPE'
  | 'INVALID_VALUE'
  | 'INVALID_VERSION'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'GATEWAY_TIMEOUT'
  | 'BAD_GATEWAY'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'CONNECTION_ERROR'
  | 'REQUEST_ERROR'
  | 'RESPONSE_ERROR'
  | 'PARSE_ERROR'
  | 'ENCODE_ERROR'
  | 'DECODE_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'PERMISSION_ERROR'
  | 'ACCESS_DENIED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'QUOTA_EXCEEDED'
  | 'RESOURCE_EXHAUSTED'
  | 'RESOURCE_NOT_FOUND'
  | 'RESOURCE_EXISTS'
  | 'RESOURCE_GONE'
  | 'RESOURCE_EXPIRED'
  | 'RESOURCE_LOCKED'
  | 'RESOURCE_MOVED'
  | 'RESOURCE_TEMPORARY_MOVED'
  | 'RESOURCE_UNAVAILABLE'
  | 'ROADMAP_CREATED'
  | 'ROADMAP_UPDATED'
  | 'ROADMAP_DELETED'
  | 'ROADMAP_NOT_FOUND'
  | 'ROADMAP_CATEGORIES_FETCHED'
  | 'ROADMAP_ENROLLED'
  | 'ROADMAP_ALREADY_ENROLLED'
  | 'MAIN_CONCEPT_CREATED'
  | 'MAIN_CONCEPT_UPDATED'
  | 'MAIN_CONCEPT_DELETED'
  | 'MAIN_CONCEPT_NOT_FOUND'
  | 'MAIN_CONCEPT_FETCHED'
  | 'MAIN_CONCEPTS_FETCHED'
  | 'SUBJECTS_FETCHED'
  | 'QUIZ_FETCHED'
  | 'QUIZ_NOT_FOUND'
  | 'QUIZ_SUBMITTED'
  | 'QUIZ_PASSED'
  | 'QUIZ_FAILED'
  | 'TOPICS_NOT_FOUND'
  | 'USER_NOT_CREATED'
  | 'PROFILE_FETCHED'
  | 'PROGRESS_FETCHED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USERNAME_CHECKED'
  | 'INVALID_PAGE_NUMBER'
  | 'ROADMAPS_FETCHED'
  | 'INVALID_ROADMAP_ID'
  | 'USERS_FETCHED'
  | 'USER_ROLE_UPDATED'
  | 'PENDING_CONTENT_FETCHED'
  | 'CONTENT_MODERATED'
  | 'CONFIG_UPDATED'
  | 'CONFIGS_FETCHED'
  | 'RESOURCES_ALLOCATED'
  | 'REPORT_GENERATED'
  | 'AUDIT_LOGS_FETCHED'
  | 'FORUMS_FETCHED'
  | 'FORUM_FETCHED'
  | 'FORUM_NOT_FOUND'
  | 'FORUM_CREATED'
  | 'FORUM_UPDATED'
  | 'FORUM_DELETED'
  | 'COURSES_FETCHED'
  | 'COURSE_FETCHED'
  | 'COURSE_NOT_FOUND'
  | 'COURSE_ENROLLED'
  | 'COURSE_ALREADY_ENROLLED'
  | 'USER_NOT_FOUND'
  | 'JOBS_FETCHED'
  | 'JOB_FETCHED'
  | 'JOB_NOT_FOUND'
  | 'JOB_CREATED'
  | 'JOB_UPDATED'
  | 'JOB_DELETED'
  | 'CHALLENGES_FETCHED'
  | 'CHALLENGE_FETCHED'
  | 'CHALLENGE_NOT_FOUND'
  | 'CHALLENGE_CREATED'
  | 'CHALLENGE_UPDATED'
  | 'CHALLENGE_SUBMITTED'
  | 'LEADERBOARD_FETCHED'
  | 'ROADMAP_FETCHED'
  | 'SUBJECT_ORDER_UPDATED'
  | 'ANALYTICS_FETCHED'
  | 'USER_ANALYTICS_FETCHED'
  | 'PLATFORM_ANALYTICS_FETCHED'
  | 'REPORT_FETCHED'
  | 'METRICS_FETCHED'
  | 'ROLE_CREATED'
  | 'ROLE_UPDATED'
  | 'ROLE_DELETED'
  | 'ROLE_HIERARCHY_FETCHED'
  | 'PERMISSION_CREATED'
  | 'PERMISSION_UPDATED'
  | 'PERMISSION_DELETED'
  | 'ROLE_ASSIGNED'
  | 'PERMISSION_CHECKED'
  | 'TICKET_STATUS_UPDATED'
  | 'FEATURE_REQUEST_VOTED'
  | 'HELP_ARTICLES_FETCHED'
  | 'CACHE_HIT'
  | 'CACHE_SET'
  | 'CACHE_CLEARED'
  | 'ARTICLES_FETCHED'
  | 'SUBJECT_NOT_FOUND';
interface ApiResponse {
  data?: any;
  error?: any;
  meta?: any;
}

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
  USERS_FETCHED: {
    status: 200,
    success: true,
    message: 'Users fetched successfully',
  },
  USER_ROLE_UPDATED: {
    status: 200,
    success: true,
    message: 'User role updated successfully',
  },
  PENDING_CONTENT_FETCHED: {
    status: 200,
    success: true,
    message: 'Pending content fetched successfully',
  },
  CONTENT_MODERATED: {
    status: 200,
    success: true,
    message: 'Content moderated successfully',
  },
  CONFIG_UPDATED: {
    status: 200,
    success: true,
    message: 'Configuration updated successfully',
  },
  CONFIGS_FETCHED: {
    status: 200,
    success: true,
    message: 'Configurations fetched successfully',
  },
  RESOURCES_ALLOCATED: {
    status: 200,
    success: true,
    message: 'Resources allocated successfully',
  },
  REPORT_GENERATED: {
    status: 200,
    success: true,
    message: 'Report generated successfully',
  },
  AUDIT_LOGS_FETCHED: {
    status: 200,
    success: true,
    message: 'Audit logs fetched successfully',
  },
  FORUMS_FETCHED: {
    status: 200,
    success: true,
    message: 'Forums fetched successfully',
  },
  FORUM_FETCHED: {
    status: 200,
    success: true,
    message: 'Forum fetched successfully',
  },
  FORUM_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Forum not found',
  },
  INVALID_PAYLOAD: {
    status: 400,
    success: false,
    message: 'Invalid payload provided',
  },
  FORUM_CREATED: {
    status: 201,
    success: true,
    message: 'Forum created successfully',
  },
  FORUM_UPDATED: {
    status: 200,
    success: true,
    message: 'Forum updated successfully',
  },
  FORUM_DELETED: {
    status: 200,
    success: true,
    message: 'Forum deleted successfully',
  },
  COURSES_FETCHED: {
    status: 200,
    success: true,
    message: 'Courses retrieved successfully',
  },
  COURSE_FETCHED: {
    status: 200,
    success: true,
    message: 'Course retrieved successfully',
  },
  COURSE_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Course not found',
  },
  COURSE_ENROLLED: {
    status: 201,
    success: true,
    message: 'Enrolled in course successfully',
  },
  COURSE_ALREADY_ENROLLED: {
    status: 400,
    success: false,
    message: 'Already enrolled in this course',
  },
  USER_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'User not found',
  },
  JOBS_FETCHED: {
    status: 200,
    success: true,
    message: 'Jobs retrieved successfully',
  },
  JOB_FETCHED: {
    status: 200,
    success: true,
    message: 'Job retrieved successfully',
  },
  JOB_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Job not found',
  },
  JOB_CREATED: {
    status: 201,
    success: true,
    message: 'Job created successfully',
  },
  JOB_UPDATED: {
    status: 200,
    success: true,
    message: 'Job updated successfully',
  },
  JOB_DELETED: {
    status: 200,
    success: true,
    message: 'Job deleted successfully',
  },
  CHALLENGES_FETCHED: {
    status: 200,
    success: true,
    message: 'Challenges retrieved successfully',
  },
  CHALLENGE_FETCHED: {
    status: 200,
    success: true,
    message: 'Challenge retrieved successfully',
  },
  CHALLENGE_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Challenge not found',
  },
  CHALLENGE_CREATED: {
    status: 201,
    success: true,
    message: 'Challenge created successfully',
  },
  CHALLENGE_UPDATED: {
    status: 200,
    success: true,
    message: 'Challenge updated successfully',
  },
  CHALLENGE_SUBMITTED: {
    status: 200,
    success: true,
    message: 'Challenge submitted successfully',
  },
  LEADERBOARD_FETCHED: {
    status: 200,
    success: true,
    message: 'Leaderboard retrieved successfully',
  },
  ROADMAP_FETCHED: {
    status: 200,
    success: true,
    message: 'Roadmap retrieved successfully',
  },
  ROADMAP_CREATED: {
    status: 201,
    success: true,
    message: 'Roadmap created successfully',
  },
  SUBJECT_ORDER_UPDATED: {
    status: 200,
    success: true,
    message: 'Subject order updated successfully',
  },
  ROADMAP_UPDATED: {
    status: 200,
    success: true,
    message: 'Roadmap updated successfully',
  },
  METRICS_FETCHED: {
    status: 200,
    success: true,
    message: 'Metrics fetched successfully',
  },
  ANALYTICS_FETCHED: {
    status: 200,
    success: true,
    message: 'Analytics data retrieved successfully',
  },
  USER_ANALYTICS_FETCHED: {
    status: 200,
    success: true,
    message: 'User analytics retrieved successfully',
  },
  PLATFORM_ANALYTICS_FETCHED: {
    status: 200,
    success: true,
    message: 'Platform analytics retrieved successfully',
  },
  REPORT_FETCHED: {
    status: 200,
    success: true,
    message: 'Report data retrieved successfully',
  },
  ROLE_CREATED: {
    status: 201,
    success: true,
    message: 'Role created successfully',
  },
  ROLE_UPDATED: {
    status: 200,
    success: true,
    message: 'Role updated successfully',
  },
  ROLE_DELETED: {
    status: 200,
    success: true,
    message: 'Role deleted successfully',
  },
  ROLE_HIERARCHY_FETCHED: {
    status: 200,
    success: true,
    message: 'Role hierarchy fetched successfully',
  },
  PERMISSION_CREATED: {
    status: 201,
    success: true,
    message: 'Permission created successfully',
  },
  PERMISSION_UPDATED: {
    status: 200,
    success: true,
    message: 'Permission updated successfully',
  },
  PERMISSION_DELETED: {
    status: 200,
    success: true,
    message: 'Permission deleted successfully',
  },
  ROLE_ASSIGNED: {
    status: 200,
    success: true,
    message: 'Role assigned successfully',
  },
  PERMISSION_CHECKED: {
    status: 200,
    success: true,
    message: 'Permission checked successfully',
  },
  TICKET_STATUS_UPDATED: {
    status: 200,
    success: true,
    message: 'Ticket status updated successfully',
  },
  FEATURE_REQUEST_VOTED: {
    status: 200,
    success: true,
    message: 'Feature request voted successfully',
  },
  HELP_ARTICLES_FETCHED: {
    status: 200,
    success: true,
    message: 'Help articles fetched successfully',
  },
  CACHE_HIT: {
    status: 200,
    success: true,
    message: 'Cache hit: Data retrieved from cache',
  },
  CACHE_SET: {
    status: 200,
    success: true,
    message: 'Cache set: Data stored successfully',
  },
  CACHE_CLEARED: {
    status: 200,
    success: true,
    message: 'Cache cleared successfully',
  },
  ROADMAP_CATEGORIES_FETCHED: {
    status: 200,
    success: true,
    message: 'Roadmap categories fetched successfully',
  },
  UNAUTHORIZED: {
    status: 401,
    success: false,
    message: 'Unauthorized',
  },
  ROADMAP_DELETED: {
    status: 200,
    success: true,
    message: 'Roadmap deleted successfully',
  },
  MAIN_CONCEPT_CREATED: {
    status: 201,
    success: true,
    message: 'Main concept created successfully',
  },
  MAIN_CONCEPT_UPDATED: {
    status: 200,
    success: true,
    message: 'Main concept updated successfully',
  },
  MAIN_CONCEPT_DELETED: {
    status: 200,
    success: true,
    message: 'Main concept deleted successfully',
  },
  MAIN_CONCEPT_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Main concept not found',
  },
  MAIN_CONCEPT_FETCHED: {
    status: 200,
    success: true,
    message: 'Main concept retrieved successfully',
  },
  ARTICLE_CREATED: {
    status: 200,
    success: true,
    message: 'Article created successfully',
  },
  ARTICLE_UPDATED: {
    status: 200,
    success: true,
    message: 'Article updated successfully',
  },
  ARTICLE_DELETED: {
    status: 200,
    success: true,
    message: 'Article deleted successfully',
  },
  ARTICLE_LIKED: {
    status: 200,
    success: true,
    message: 'Article liked successfully',
  },
  ARTICLE_UNLIKED: {
    status: 200,
    success: true,
    message: 'Article unliked successfully',
  },
  ARTICLE_BOOKMARKED: {
    status: 200,
    success: true,
    message: 'Article bookmarked successfully',
  },
  ARTICLE_UNBOOKMARKED: {
    status: 200,
    success: true,
    message: 'Article unbookmarked successfully',
  },
  ARTICLE_COMMENTED: {
    status: 200,
    success: true,
    message: 'Article commented successfully',
  },
  COMMENT_DELETED: {
    status: 200,
    success: true,
    message: 'Comment deleted successfully',
  },
  COMMENT_UPDATED: {
    status: 200,
    success: true,
    message: 'Comment updated successfully',
  },
  COMMENT_LIKED: {
    status: 200,
    success: true,
    message: 'Comment liked successfully',
  },
  COMMENT_UNLIKED: {
    status: 200,
    success: true,
    message: 'Comment unliked successfully',
  },
  COMMENT_REPLIED: {
    status: 200,
    success: true,
    message: 'Comment replied successfully',
  },
  COMMENT_REPLY_DELETED: {
    status: 200,
    success: true,
    message: 'Comment reply deleted successfully',
  },
  COMMENT_REPLY_UPDATED: {
    status: 200,
    success: true,
    message: 'Comment reply updated successfully',
  },
  COMMENT_REPLY_LIKED: {
    status: 200,
    success: true,
    message: 'Comment reply liked successfully',
  },
  COMMENT_REPLY_UNLIKED: {
    status: 200,
    success: true,
    message: 'Comment reply unliked successfully',
  },
  USER_PROFILE_FETCHED: {
    status: 200,
    success: true,
    message: 'User profile retrieved successfully',
  },
  USER_PROFILE_UPDATED: {
    status: 200,
    success: true,
    message: 'User profile updated successfully',
  },
  USER_ARTICLES_FETCHED: {
    status: 200,
    success: true,
    message: 'User articles retrieved successfully',
  },
  USER_BOOKMARKS_FETCHED: {
    status: 200,
    success: true,
    message: 'User bookmarks retrieved successfully',
  },
  USER_LIKES_FETCHED: {
    status: 200,
    success: true,
    message: 'User likes retrieved successfully',
  },
  USER_COMMENTS_FETCHED: {
    status: 200,
    success: true,
    message: 'User comments retrieved successfully',
  },
  USER_REPLIES_FETCHED: {
    status: 200,
    success: true,
    message: 'User replies retrieved successfully',
  },
  USER_NOTIFICATIONS_FETCHED: {
    status: 200,
    success: true,
    message: 'User notifications retrieved successfully',
  },
  USER_NOTIFICATION_READ: {
    status: 200,
    success: true,
    message: 'User notification read successfully',
  },
  USER_NOTIFICATION_DELETED: {
    status: 200,
    success: true,
    message: 'User notification deleted successfully',
  },
  USER_NOTIFICATION_CLEARED: {
    status: 200,
    success: true,
    message: 'User notifications cleared successfully',
  },
  USER_SETTINGS_FETCHED: {
    status: 200,
    success: true,
    message: 'User settings retrieved successfully',
  },
  USER_SETTINGS_UPDATED: {
    status: 200,
    success: true,
    message: 'User settings updated successfully',
  },
  USER_PASSWORD_UPDATED: {
    status: 200,
    success: true,
    message: 'User password updated successfully',
  },
  USER_EMAIL_UPDATED: {
    status: 200,
    success: true,
    message: 'User email updated successfully',
  },
  USER_DELETED: {
    status: 200,
    success: true,
    message: 'User deleted successfully',
  },
  USER_LOGGED_OUT: {
    status: 200,
    success: true,
    message: 'User logged out successfully',
  },
  USER_LOGGED_IN: {
    status: 200,
    success: true,
    message: 'User logged in successfully',
  },
  USER_REGISTERED: {
    status: 200,
    success: true,
    message: 'User registered successfully',
  },
  USER_VERIFIED: {
    status: 200,
    success: true,
    message: 'User verified successfully',
  },
  USER_PASSWORD_RESET: {
    status: 200,
    success: true,
    message: 'User password reset successfully',
  },
  USER_PASSWORD_RESET_REQUESTED: {
    status: 200,
    success: true,
    message: 'User password reset requested successfully',
  },
  USER_EMAIL_VERIFICATION_SENT: {
    status: 200,
    success: true,
    message: 'User email verification sent successfully',
  },
  USER_EMAIL_VERIFICATION_RESENT: {
    status: 200,
    success: true,
    message: 'User email verification resent successfully',
  },
  USER_EMAIL_VERIFICATION_FAILED: {
    status: 200,
    success: true,
    message: 'User email verification failed',
  },
  USER_PASSWORD_RESET_FAILED: {
    status: 200,
    success: true,
    message: 'User password reset failed',
  },
  USER_LOGIN_FAILED: {
    status: 200,
    success: true,
    message: 'User login failed',
  },
  USER_REGISTRATION_FAILED: {
    status: 400,
    success: false,
    message: 'User registration failed',
  },
  USER_VERIFICATION_FAILED: {
    status: 400,
    success: false,
    message: 'User verification failed',
  },
  INVALID_TOKEN: {
    status: 400,
    success: false,
    message: 'Invalid token',
  },
  INVALID_CREDENTIALS: {
    status: 400,
    success: false,
    message: 'Invalid credentials',
  },
  INVALID_EMAIL: {
    status: 400,
    success: false,
    message: 'Invalid email',
  },
  INVALID_PASSWORD: {
    status: 400,
    success: false,
    message: 'Invalid password',
  },
  INVALID_CODE: {
    status: 400,
    success: false,
    message: 'Invalid code',
  },
  INVALID_REQUEST: {
    status: 400,
    success: false,
    message: 'Invalid request',
  },
  INVALID_RESPONSE: {
    status: 400,
    success: false,
    message: 'Invalid response',
  },
  INVALID_STATE: {
    status: 400,
    success: false,
    message: 'Invalid state',
  },
  INVALID_STATUS: {
    status: 400,
    success: false,
    message: 'Invalid status',
  },
  INVALID_TYPE: {
    status: 400,
    success: false,
    message: 'Invalid type',
  },
  INVALID_VALUE: {
    status: 400,
    success: false,
    message: 'Invalid value',
  },
  INVALID_VERSION: {
    status: 400,
    success: false,
    message: 'Invalid version',
  },
  FORBIDDEN: {
    status: 403,
    success: false,
    message: 'Forbidden',
  },
  NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Not found',
  },
  CONFLICT: {
    status: 409,
    success: false,
    message: 'Conflict',
  },
  TOO_MANY_REQUESTS: {
    status: 429,
    success: false,
    message: 'Too many requests',
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    success: false,
    message: 'Internal server error',
  },
  SERVICE_UNAVAILABLE: {
    status: 503,
    success: false,
    message: 'Service unavailable',
  },
  GATEWAY_TIMEOUT: {
    status: 504,
    success: false,
    message: 'Gateway timeout',
  },
  BAD_GATEWAY: {
    status: 502,
    success: false,
    message: 'Bad gateway',
  },
  NETWORK_ERROR: {
    status: 500,
    success: false,
    message: 'Network error',
  },
  TIMEOUT_ERROR: {
    status: 500,
    success: false,
    message: 'Timeout error',
  },
  CONNECTION_ERROR: {
    status: 500,
    success: false,
    message: 'Connection error',
  },
  REQUEST_ERROR: {
    status: 500,
    success: false,
    message: 'Request error',
  },
  RESPONSE_ERROR: {
    status: 500,
    success: false,
    message: 'Response error',
  },
  PARSE_ERROR: {
    status: 500,
    success: false,
    message: 'Parse error',
  },
  ENCODE_ERROR: {
    status: 500,
    success: false,
    message: 'Encode error',
  },
  DECODE_ERROR: {
    status: 500,
    success: false,
    message: 'Decode error',
  },
  VALIDATION_ERROR: {
    status: 500,
    success: false,
    message: 'Validation error',
  },
  AUTHENTICATION_ERROR: {
    status: 401,
    success: false,
    message: 'Authentication error',
  },
  AUTHORIZATION_ERROR: {
    status: 401,
    success: false,
    message: 'Authorization error',
  },
  PERMISSION_ERROR: {
    status: 401,
    success: false,
    message: 'Permission error',
  },
  ACCESS_DENIED: {
    status: 401,
    success: false,
    message: 'Access denied',
  },
  RATE_LIMIT_EXCEEDED: {
    status: 429,
    success: false,
    message: 'Rate limit exceeded',
  },
  QUOTA_EXCEEDED: {
    status: 403,
    success: false,
    message: 'Quota exceeded',
  },
  RESOURCE_EXHAUSTED: {
    status: 403,
    success: false,
    message: 'Resource exhausted',
  },
  RESOURCE_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Resource not found',
  },
  RESOURCE_EXISTS: {
    status: 409,
    success: false,
    message: 'Resource exists',
  },
  RESOURCE_GONE: {
    status: 410,
    success: false,
    message: 'Resource gone',
  },
  RESOURCE_EXPIRED: {
    status: 410,
    success: false,
    message: 'Resource expired',
  },
  RESOURCE_LOCKED: {
    status: 423,
    success: false,
    message: 'Resource locked',
  },
  RESOURCE_MOVED: {
    status: 301,
    success: false,
    message: 'Resource moved',
  },
  RESOURCE_TEMPORARY_MOVED: {
    status: 302,
    success: false,
    message: 'Resource temporarily moved',
  },
  RESOURCE_UNAVAILABLE: {
    status: 503,
    success: false,
    message: 'Resource unavailable',
  },
};

export const sendResponse = (
  res: Response,
  type: ResponseType,
  response: ApiResponse = {}
) => {
  const config = RESPONSE_MESSAGES[type];
  return res.status(config.status).json({
    type,
    success: config.success,
    message: config.message,
    ...response,
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
