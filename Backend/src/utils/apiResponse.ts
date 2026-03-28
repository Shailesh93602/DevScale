import { Response } from 'express';
import logger from './logger.js';

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
  | 'USER_DELETED'
  | 'USERNAME_CHECKED'
  | 'INVALID_PAGE_NUMBER'
  | 'ROADMAPS_FETCHED'
  | 'MAIN_CONCEPTS_FETCHED'
  | 'ROADMAP_NOT_FOUND'
  | 'ROADMAP_ENROLLED'
  | 'INVALID_ROADMAP_ID'
  | 'ROADMAP_ALREADY_ENROLLED'
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
  | 'INVALID_PAYLOAD'
  | 'FORUM_CREATED'
  | 'FORUM_UPDATED'
  | 'FORUM_DELETED'
  | 'COURSES_FETCHED'
  | 'COURSE_FETCHED'
  | 'COURSE_NOT_FOUND'
  | 'COURSE_ENROLLED'
  | 'COURSE_ALREADY_ENROLLED'
  | 'ENROLLMENTS_FETCHED'
  | 'ENROLLMENT_NOT_FOUND'
  | 'ENROLLMENT_UPDATED'
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
  | 'ROADMAP_CREATED'
  | 'SUBJECT_ORDER_UPDATED'
  | 'ROADMAP_UPDATED'
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
  | 'ARTICLE_UPDATED'
  | 'BATTLES_FETCHED'
  | 'BATTLE_FETCHED'
  | 'BATTLE_NOT_FOUND'
  | 'BATTLE_CREATED'
  | 'BATTLE_UPDATED'
  | 'BATTLE_DELETED'
  | 'BATTLE_JOINED'
  | 'BATTLE_LEFT'
  | 'STATISTICS_FETCHED'
  | 'ANSWER_SUBMITTED'
  | 'CHATS_FETCHED'
  | 'CHAT_FETCHED'
  | 'CHAT_NOT_FOUND'
  | 'CHAT_CREATED'
  | 'CHAT_MESSAGE_SENT'
  | 'CHAT_DELETED'
  | 'MAIN_CONCEPT_CREATED'
  | 'MAIN_CONCEPT_UPDATED'
  | 'MAIN_CONCEPT_DELETED'
  | 'MAIN_CONCEPT_NOT_FOUND'
  | 'MAIN_CONCEPT_FETCHED'
  | 'RESOURCES_FETCHED'
  | 'BOOKS_FETCHED'
  | 'PREDICTED'
  | 'QUESTIONS_FETCHED'
  | 'QUESTION_CREATED'
  | 'QUESTION_UPDATED'
  | 'QUESTION_DELETED'
  | 'QUESTIONS_SUBMITTED'
  | 'QUIZ_CREATED'
  | 'QUIZ_UPDATED'
  | 'QUIZ_DELETED'
  | 'USER_PROGRESS_FETCHED'
  | 'TOPIC_ADDED'
  | 'TOPIC_UPDATED'
  | 'TOPIC_DELETED'
  | 'RESOURCE_FETCHED'
  | 'SUBJECTS_CREATED'
  | 'ARTICLE_CREATED'
  | 'SUBJECT_UPDATED'
  | 'SUBJECT_DELETED'
  | 'SUBJECTS_UPDATED'
  | 'SUBJECTS_DELETED'
  | 'ARTICLE_DELETED'
  | 'INTERVIEW_QUESTIONS_FETCHED'
  | 'INTERVIEW_QUESTION_CREATED'
  | 'INTERVIEW_QUESTION_UPDATED'
  | 'RESOURCE_CREATED'
  | 'RESOURCE_DETAILS_FETCHED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'ROADMAP_DELETED'
  | 'ROADMAP_CATEGORIES_FETCHED'
  | 'SUBJECT_CREATED'
  | 'TICKET_CREATED'
  | 'TICKET_RESPONSE_ADDED'
  | 'BUG_REPORT_CREATED'
  | 'FEATURE_REQUEST_CREATED'
  | 'HELP_ARTICLE_CREATED'
  | 'USERNAME_AVAILABILITY_CHECKED'
  | 'ROADMAP_REMOVED'
  | 'PROGRESS_UPDATED'
  | 'ROADMAP_LIKED'
  | 'ROADMAP_UNLIKED'
  | 'ROADMAP_BOOKMARKED'
  | 'ROADMAP_UNBOOKMARKED'
  | 'SOMETHING_WRONG'
  | 'MODERATION_QUEUE_FETCHED'
  | 'DASHBOARD_STATS_FETCHED'
  | 'RECENT_ACTIVITIES_FETCHED'
  | 'LEARNING_PROGRESS_FETCHED'
  | 'ACHIEVEMENTS_FETCHED'
  | 'STREAK_UPDATED'
  | 'STREAK_STATS_FETCHED'
  | 'WEEKLY_ACTIVITY_FETCHED'
  | 'COMMENTS_FETCHED'
  | 'COMMENT_ADDED'
  | 'COMMENT_LIKED'
  | 'COMMENT_UNLIKED'
  | 'BATTLE_STATUS_UPDATED'
  | 'BATTLE_ARCHIVED'
  | 'BATTLE_READY'
  | 'BATTLE_STARTED'
  | 'BATTLE_CANCELLED'
  | 'BATTLE_RESULTS_FETCHED'
  | 'DRAFT_SAVED'
  | 'DRAFT_FETCHED'
  | 'CODE_EXECUTED'
  | 'BATTLE_QUESTIONS_ADDED'
  | 'DASHBOARD_SUMMARY_FETCHED'
  | 'BATTLE_GLOBAL_STATS_FETCHED'
  | 'QUESTION_POOL_FETCHED'
  | 'QUESTION_POOL_EMPTY'
  | 'BATTLE_MY_RESULTS_FETCHED';

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
    status: 200,
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
  USER_DELETED: {
    status: 200,
    success: true,
    message: 'User deleted successfully',
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
  ENROLLMENTS_FETCHED: {
    status: 200,
    success: true,
    message: 'Enrollments retrieved successfully',
  },
  ENROLLMENT_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Enrollment not found',
  },
  ENROLLMENT_UPDATED: {
    status: 200,
    success: true,
    message: 'Enrollment updated successfully',
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
  ARTICLE_UPDATED: {
    status: 200,
    success: true,
    message: 'Article updated successfully',
  },
  BATTLES_FETCHED: {
    status: 200,
    success: true,
    message: 'Battles retrieved successfully',
  },
  BATTLE_FETCHED: {
    status: 200,
    success: true,
    message: 'Battle retrieved successfully',
  },
  BATTLE_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Battle not found',
  },
  BATTLE_CREATED: {
    status: 201,
    success: true,
    message: 'Battle created successfully',
  },
  BATTLE_UPDATED: {
    status: 200,
    success: true,
    message: 'Battle updated successfully',
  },
  BATTLE_DELETED: {
    status: 200,
    success: true,
    message: 'Battle deleted successfully',
  },
  BATTLE_JOINED: {
    status: 200,
    success: true,
    message: 'Battle joined successfully',
  },
  BATTLE_LEFT: {
    status: 200,
    success: true,
    message: 'Battle left successfully',
  },
  STATISTICS_FETCHED: {
    status: 200,
    success: true,
    message: 'Statistics fetched successfully',
  },
  ANSWER_SUBMITTED: {
    status: 200,
    success: true,
    message: 'Answer submitted successfully',
  },
  CHATS_FETCHED: {
    status: 200,
    success: true,
    message: 'Chats retrieved successfully',
  },
  CHAT_FETCHED: {
    status: 200,
    success: true,
    message: 'Chat retrieved successfully',
  },
  CHAT_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Chat not found',
  },
  CHAT_CREATED: {
    status: 201,
    success: true,
    message: 'Chat created successfully',
  },
  CHAT_MESSAGE_SENT: {
    status: 201,
    success: true,
    message: 'Message sent successfully',
  },
  CHAT_DELETED: {
    status: 200,
    success: true,
    message: 'Chat deleted successfully',
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
    message: 'Main concept fetched successfully',
  },
  RESOURCES_FETCHED: {
    status: 200,
    success: true,
    message: 'Resources fetched successfully',
  },
  BOOKS_FETCHED: {
    status: 200,
    success: true,
    message: 'Books fetched successfully',
  },

  PREDICTED: {
    status: 200,
    success: true,
    message: 'Prediction made successfully',
  },
  QUESTIONS_FETCHED: {
    status: 200,
    success: true,
    message: 'Questions fetched successfully',
  },
  QUESTION_CREATED: {
    status: 201,
    success: true,
    message: 'Question created successfully',
  },
  QUESTION_UPDATED: {
    status: 200,
    success: true,
    message: 'Question updated successfully',
  },
  QUESTION_DELETED: {
    status: 200,
    success: true,
    message: 'Question deleted successfully',
  },
  QUESTIONS_SUBMITTED: {
    status: 200,
    success: true,
    message: 'Questions submitted successfully',
  },
  QUIZ_CREATED: {
    status: 201,
    success: true,
    message: 'Quiz created successfully',
  },
  QUIZ_UPDATED: {
    status: 200,
    success: true,
    message: 'Quiz updated successfully',
  },
  QUIZ_DELETED: {
    status: 200,
    success: true,
    message: 'Quiz deleted successfully',
  },
  USER_PROGRESS_FETCHED: {
    status: 200,
    success: true,
    message: 'User progress fetched successfully',
  },
  TOPIC_ADDED: {
    status: 201,
    success: true,
    message: 'Topic added successfully',
  },
  TOPIC_UPDATED: {
    status: 200,
    success: true,
    message: 'Topic updated successfully',
  },
  TOPIC_DELETED: {
    status: 200,
    success: true,
    message: 'Topic deleted successfully',
  },
  CODE_EXECUTED: {
    status: 200,
    success: true,
    message: 'Code executed successfully',
  },
  RESOURCE_FETCHED: {
    status: 200,
    success: true,
    message: 'Resource fetched successfully',
  },
  SUBJECTS_CREATED: {
    status: 201,
    success: true,
    message: 'Subjects created successfully',
  },
  SUBJECTS_UPDATED: {
    status: 200,
    success: true,
    message: 'Subjects updated successfully',
  },
  SUBJECTS_DELETED: {
    status: 200,
    success: true,
    message: 'Subjects deleted successfully',
  },
  ARTICLE_CREATED: {
    status: 201,
    success: true,
    message: 'Article created successfully',
  },
  ARTICLE_DELETED: {
    status: 200,
    success: true,
    message: 'Article deleted successfully',
  },
  INTERVIEW_QUESTIONS_FETCHED: {
    status: 200,
    success: true,
    message: 'Interview questions fetched successfully',
  },
  INTERVIEW_QUESTION_CREATED: {
    status: 201,
    success: true,
    message: 'Interview question created successfully',
  },
  INTERVIEW_QUESTION_UPDATED: {
    status: 200,
    success: true,
    message: 'Interview question updated successfully',
  },
  SUBJECT_UPDATED: {
    status: 200,
    success: true,
    message: 'Subject updated successfully',
  },
  SUBJECT_DELETED: {
    status: 200,
    success: true,
    message: 'Subject deleted successfully',
  },
  RESOURCE_CREATED: {
    status: 201,
    success: true,
    message: 'Resource created successfully',
  },
  RESOURCE_DETAILS_FETCHED: {
    status: 200,
    success: true,
    message: 'Resource details fetched successfully',
  },
  UNAUTHORIZED: {
    status: 401,
    success: false,
    message: 'Unauthorized',
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
  ROADMAP_DELETED: {
    status: 200,
    success: true,
    message: 'Roadmap deleted successfully',
  },
  ROADMAP_CATEGORIES_FETCHED: {
    status: 200,
    success: true,
    message: 'Roadmap categories fetched successfully',
  },
  SUBJECT_CREATED: {
    status: 201,
    success: true,
    message: 'Subject created successfully',
  },
  TICKET_CREATED: {
    status: 201,
    success: true,
    message: 'Ticket created successfully',
  },
  TICKET_RESPONSE_ADDED: {
    status: 200,
    success: true,
    message: 'Ticket response added successfully',
  },
  BUG_REPORT_CREATED: {
    status: 201,
    success: true,
    message: 'Bug report created successfully',
  },
  FEATURE_REQUEST_CREATED: {
    status: 201,
    success: true,
    message: 'Feature request created successfully',
  },
  HELP_ARTICLE_CREATED: {
    status: 201,
    success: true,
    message: 'Help article created successfully',
  },
  USERNAME_AVAILABILITY_CHECKED: {
    status: 200,
    success: true,
    message: 'Username availability checked successfully',
  },
  ROADMAP_REMOVED: {
    status: 200,
    success: true,
    message: 'Roadmap removed successfully',
  },
  PROGRESS_UPDATED: {
    status: 200,
    success: true,
    message: 'Progress updated successfully',
  },
  ROADMAP_LIKED: {
    status: 200,
    success: true,
    message: 'Roadmap liked successfully',
  },
  ROADMAP_UNLIKED: {
    status: 200,
    success: true,
    message: 'Roadmap unliked successfully',
  },
  ROADMAP_BOOKMARKED: {
    status: 200,
    success: true,
    message: 'Roadmap bookmarked successfully',
  },
  ROADMAP_UNBOOKMARKED: {
    status: 200,
    success: true,
    message: 'Roadmap unbookmarked successfully',
  },
  SOMETHING_WRONG: {
    status: 500,
    success: false,
    message: 'Something went wrong',
  },
  MODERATION_QUEUE_FETCHED: {
    status: 200,
    success: true,
    message: 'Moderation queue fetched successfully',
  },
  DASHBOARD_STATS_FETCHED: {
    status: 200,
    success: true,
    message: 'Dashboard stats fetched successfully',
  },
  RECENT_ACTIVITIES_FETCHED: {
    status: 200,
    success: true,
    message: 'Recent activities fetched successfully',
  },
  LEARNING_PROGRESS_FETCHED: {
    status: 200,
    success: true,
    message: 'Learning progress fetched successfully',
  },
  ACHIEVEMENTS_FETCHED: {
    status: 200,
    success: true,
    message: 'Achievements fetched successfully',
  },
  STREAK_UPDATED: {
    status: 200,
    success: true,
    message: 'Streak updated successfully',
  },
  STREAK_STATS_FETCHED: {
    status: 200,
    success: true,
    message: 'Streak stats fetched successfully',
  },
  WEEKLY_ACTIVITY_FETCHED: {
    status: 200,
    success: true,
    message: 'Weekly activity fetched successfully',
  },
  COMMENTS_FETCHED: {
    status: 200,
    success: true,
    message: 'Comments fetched successfully',
  },
  COMMENT_ADDED: {
    status: 200,
    success: true,
    message: 'Comment added successfully',
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
  BATTLE_STATUS_UPDATED: {
    status: 200,
    success: true,
    message: 'Battle status updated successfully',
  },
  BATTLE_ARCHIVED: {
    status: 200,
    success: true,
    message: 'Battle archived successfully',
  },
  DRAFT_SAVED: {
    status: 200,
    success: true,
    message: 'Progress saved successfully',
  },
  DRAFT_FETCHED: {
    status: 200,
    success: true,
    message: 'Progress retrieved successfully',
  },
  BATTLE_READY: {
    status: 200,
    success: true,
    message: 'Ready status updated',
  },
  BATTLE_STARTED: {
    status: 200,
    success: true,
    message: 'Battle started successfully',
  },
  BATTLE_CANCELLED: {
    status: 200,
    success: true,
    message: 'Battle cancelled successfully',
  },
  BATTLE_RESULTS_FETCHED: {
    status: 200,
    success: true,
    message: 'Battle results retrieved successfully',
  },
  BATTLE_MY_RESULTS_FETCHED: {
    status: 200,
    success: true,
    message: 'Your battle results retrieved successfully',
  },
  BATTLE_QUESTIONS_ADDED: {
    status: 201,
    success: true,
    message: 'Questions added to battle successfully',
  },
  DASHBOARD_SUMMARY_FETCHED: {
    status: 200,
    success: true,
    message: 'Dashboard summary fetched successfully',
  },
  BATTLE_GLOBAL_STATS_FETCHED: {
    status: 200,
    success: true,
    message: 'Battle global stats fetched successfully',
  },
  QUESTION_POOL_FETCHED: {
    status: 200,
    success: true,
    message: 'Question pool fetched successfully',
  },
  QUESTION_POOL_EMPTY: {
    status: 200,
    success: true,
    message: 'No questions available for the selected source',
  },
};

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
