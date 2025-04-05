export type ResponseType =
  | 'SUCCESS'
  | 'ERROR'
  | 'UNAUTHORIZED'
  | 'DASHBOARD_STATS_FETCHED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'METRICS_FETCHED'
  | 'USERS_FETCHED'
  | 'USER_UPDATED'
  | 'CONFIG_UPDATED'
  | 'CONFIGS_FETCHED'
  | 'RESOURCES_ALLOCATED'
  | 'REPORT_GENERATED'
  | 'AUDIT_LOGS_FETCHED'
  | 'MODERATION_QUEUE_FETCHED'
  | 'CONTENT_MODERATED';

export interface ApiResponse<T = any> {
  status: ResponseType;
  message?: string;
  data?: T;
  error?: any;
}
