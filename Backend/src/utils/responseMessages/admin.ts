import type { ResponseConfig } from './types.js';

/** Admin dashboard: configuration, reports, analytics, moderation and cache. */
export const adminMessages = {
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
  METRICS_FETCHED: {
    status: 200,
    success: true,
    message: 'Metrics fetched successfully',
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
  CACHE_HIT: {
    status: 200,
    success: true,
    message: 'Cache hit: Data retrieved from cache',
  },
  CACHE_CLEARED: {
    status: 200,
    success: true,
    message: 'Cache cleared successfully',
  },
  MODERATION_QUEUE_FETCHED: {
    status: 200,
    success: true,
    message: 'Moderation queue fetched successfully',
  },
} satisfies Record<string, ResponseConfig>;
