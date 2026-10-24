// With Redis failing, the dashboard summary is computed live rather than answered with an error.
import { describe, it, expect, jest } from '@jest/globals';

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {},
    $queryRaw: async () => [{ enrolled_count: 3 }],
  },
}));

import { redis } from '../../services/cacheService';
import { DashboardRepository } from '../../repositories/dashboardRepository';

describe('dashboard summary with Redis down', () => {
  it('builds the summary live when every cache command rejects', async () => {
    const down = async () => {
      throw new Error('Connection is closed.');
    };
    jest.spyOn(redis, 'get').mockImplementation(down);
    jest.spyOn(redis, 'setex').mockImplementation(down);
    const summary = (await new DashboardRepository().getDashboardSummary(
      'u1'
    )) as { stats: { enrolledRoadmaps: number } };
    expect(summary.stats.enrolledRoadmaps).toBe(3);
    expect(redis.get).toHaveBeenCalledWith('dashboard:summary:u1');
  });
});
