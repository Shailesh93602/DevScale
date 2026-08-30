import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * A metric with no data reports "no data", not zero.
 *
 * `averageSessionDuration`, `averageResponseTime` and `errorRate` were all
 * computed from `prisma.auditLog` — a table that **nothing in this codebase
 * writes to** (zero `auditLog.create` call sites). Each divided by
 * `(length || 1)`, so an empty result set produced a clean `0`, and the admin
 * panel rendered it as "0m", "0ms" and "0.00%": three measurements presented as
 * fact, permanently, measuring nothing.
 *
 * The code was not wrong in any way review would catch — it was correct
 * arithmetic over an empty set. That is why the guard has to be a test.
 *
 * These assert null-for-no-data, and that a real zero still reports as zero:
 * the distinction is the entire point, so a fix that returned null for both
 * would be no better than the bug.
 */

const mockFindMany = jest.fn<(...args: unknown[]) => Promise<unknown[]>>();
const mockCount = jest.fn<(...args: unknown[]) => Promise<number>>();
const mockUserCount = jest.fn<(...args: unknown[]) => Promise<number>>();
const mockQueryRaw = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockGroupBy = jest.fn<(...args: unknown[]) => Promise<unknown[]>>();

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    auditLog: {
      findMany: (...a: unknown[]) => mockFindMany(...a),
      count: (...a: unknown[]) => mockCount(...a),
      groupBy: (...a: unknown[]) => mockGroupBy(...a),
    },
    user: { count: (...a: unknown[]) => mockUserCount(...a) },
    $queryRaw: (...a: unknown[]) => mockQueryRaw(...a),
  },
}));
jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn(), ping: jest.fn() },
}));

import AdminDashboardRepository from '../../repositories/adminDashboardRepository';

const repo = new AdminDashboardRepository();

/**
 * Reached through a cast, deliberately.
 *
 * `getActivityMetrics` is private, and its public caller `getDashboardMetrics`
 * fans out to the user repository, the cache, platform metrics and system
 * health. Mocking all four to assert one arithmetic property would test less
 * and break more often. The cast is the smaller lie.
 */
const activity = () =>
  (
    repo as unknown as {
      getActivityMetrics(): Promise<{ averageSessionDuration: number | null }>;
    }
  ).getActivityMetrics();

beforeEach(() => {
  jest.clearAllMocks();
  mockUserCount.mockResolvedValue(0);
  mockQueryRaw.mockResolvedValue([]);
  mockGroupBy.mockResolvedValue([]);
  mockCount.mockResolvedValue(0);
});

describe('activity metrics are honest about missing data', () => {
  it('reports null — not 0 — when no SESSION rows exist', async () => {
    mockFindMany.mockResolvedValue([]);
    const metrics = await activity();
    expect(metrics.averageSessionDuration).toBeNull();
  });

  it('still reports a real average when rows exist', async () => {
    mockFindMany.mockResolvedValue([
      { details: { duration: 10 } },
      { details: { duration: 20 } },
    ]);
    const metrics = await activity();
    expect(metrics.averageSessionDuration).toBe(15);
  });

  it('reports a genuine zero as zero, not as null', async () => {
    // The whole point of the change is telling these two apart. A fix that
    // collapsed "measured, and it was zero" into null would be the same bug
    // wearing the opposite sign.
    mockFindMany.mockResolvedValue([{ details: { duration: 0 } }]);
    const metrics = await activity();
    expect(metrics.averageSessionDuration).toBe(0);
  });
});
