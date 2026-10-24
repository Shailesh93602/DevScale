import { deleteCache } from '../../services/cacheService.js';

/** Five minutes, as before; now in Redis so every instance sees the same copy. */
export const DASHBOARD_SUMMARY_TTL_SECONDS = 300;

export const dashboardSummaryKey = (userId: string): string =>
  `dashboard:summary:${userId}`;

/** Drops a user's cached summary on every instance. Call after any write the summary reads. */
export function invalidateDashboardSummary(userId: string): Promise<void> {
  return deleteCache(dashboardSummaryKey(userId));
}
