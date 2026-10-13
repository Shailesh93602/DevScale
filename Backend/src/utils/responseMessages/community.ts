import type { ResponseConfig } from './types.js';

/** Community: forums, jobs, chats and the support desk. */
export const communityMessages = {
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
  CHATS_FETCHED: {
    status: 200,
    success: true,
    message: 'Chats retrieved successfully',
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
} satisfies Record<string, ResponseConfig>;
