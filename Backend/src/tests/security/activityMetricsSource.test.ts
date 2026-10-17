// eduscale-backend#23-08 — admin activity numbers come from tables something writes.
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

type Fn = (...args: unknown[]) => Promise<unknown>;
const queryRaw = jest.fn<Fn>();
const auditCount = jest.fn<Fn>(async () => 0);
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    $queryRaw: (...a: unknown[]) => queryRaw(...a),
    auditLog: {
      count: (...a: unknown[]) => auditCount(...a),
      findMany: async () => [],
    },
  },
}));
jest.mock('../../services/cacheService', () => ({
  getCache: async () => 'ok',
  setCache: async () => undefined,
}));

import {
  getActivityMetrics,
  getSystemHealth,
} from '../../repositories/adminDashboard/healthMetrics';

const sqlOf = (call: unknown[]) => (call[0] as string[]).join('?');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('activity metrics', () => {
  it('counts distinct users from recorded activity, not the unwritten auditLog', async () => {
    queryRaw.mockImplementation(async (...a: unknown[]) =>
      sqlOf(a).includes('COUNT(DISTINCT user_id)') ? [{ n: 4 }] : []
    );
    const m = await getActivityMetrics();
    expect(m.dailyActiveUsers).toBe(4);
    expect(auditCount).not.toHaveBeenCalled();
  });

  it('buckets peak usage by hour of day', async () => {
    queryRaw.mockImplementation(async (...a: unknown[]) =>
      sqlOf(a).includes('EXTRACT(HOUR')
        ? [{ hour: 9 }, { hour: 21 }]
        : [{ n: 0 }]
    );
    expect((await getActivityMetrics()).peakUsageTimes).toEqual([
      '09:00',
      '21:00',
    ]);
  });
});

describe('system health', () => {
  it('reports the database as down when a round trip fails', async () => {
    queryRaw.mockRejectedValue(new Error('connection refused'));
    expect((await getSystemHealth()).databaseStatus).not.toBe('healthy');
  });
});
