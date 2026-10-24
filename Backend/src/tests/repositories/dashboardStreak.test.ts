// The dashboard reads current_streak, which is only rewritten on activity — so
// a streak abandoned weeks ago kept showing its old length.
import { describe, it, expect, jest, afterEach } from '@jest/globals';

const lastActivity = '2026-09-20T10:00:00Z';
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {},
    userRoadmap: { count: async () => 0, findMany: async () => [] },
    topic: { count: async () => 0 },
    userProgress: {
      count: async () => 0,
      aggregate: async () => ({ _sum: { time_spent: 0 } }),
      findMany: async () => [],
    },
    userStreak: {
      findUnique: async () => ({
        current_streak: 12,
        last_activity_date: new Date(lastActivity),
        timezone: 'UTC',
      }),
    },
    $queryRaw: async () => [
      {
        streak: {
          current_streak: 12,
          longest_streak: 12,
          last_activity_date: lastActivity,
          streak_start_date: null,
          timezone: 'UTC',
        },
      },
    ],
  },
}));

import { DashboardRepository } from '../../repositories/dashboardRepository';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('dashboard streak', () => {
  const threeWeeksLater = new Date('2026-10-11T09:00:00Z').getTime();

  it('GET /dashboard/stats reports an abandoned streak as 0', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(threeWeeksLater);
    const stats = await new DashboardRepository().getDashboardStats('u1');
    expect(stats.streakDays).toBe(0);
  });

  it('GET /dashboard/summary reports an abandoned streak as 0', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(threeWeeksLater);
    const summary = (await new DashboardRepository().getDashboardSummary(
      'u2'
    )) as { streak: { currentStreak: number; longestStreak: number } | null };
    expect(summary.streak?.currentStreak).toBe(0);
    expect(summary.streak?.longestStreak).toBe(12);
  });
});
