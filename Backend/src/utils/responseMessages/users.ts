import type { ResponseConfig } from './types.js';

/** Users, profiles, progress, RBAC and the personal dashboard. */
export const usersMessages = {
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
  USERS_FETCHED: {
    status: 200,
    success: true,
    message: 'Users fetched successfully',
  },
  ROLES_FETCHED: {
    status: 200,
    success: true,
    message: 'Roles fetched successfully',
  },
  USER_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'User not found',
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
  USER_PROGRESS_FETCHED: {
    status: 200,
    success: true,
    message: 'User progress fetched successfully',
  },
  USERNAME_AVAILABILITY_CHECKED: {
    status: 200,
    success: true,
    message: 'Username availability checked successfully',
  },
  PROGRESS_UPDATED: {
    status: 200,
    success: true,
    message: 'Progress updated successfully',
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
  DASHBOARD_SUMMARY_FETCHED: {
    status: 200,
    success: true,
    message: 'Dashboard summary fetched successfully',
  },
} satisfies Record<string, ResponseConfig>;
