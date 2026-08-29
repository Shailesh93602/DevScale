import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * Retention. An audit table only ever grows, so every index on it grows too and
 * the admin panel's queries against it get slower forever — invisibly for
 * months, then permanently.
 */

type Row = { id: string };

const adminFind = jest.fn<() => Promise<Row[]>>();
const adminDelete = jest.fn<() => Promise<{ count: number }>>();
const secFind = jest.fn<() => Promise<Row[]>>();
const secDelete = jest.fn<() => Promise<{ count: number }>>();

const findArgs: Array<Record<string, unknown>> = [];

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    adminAuditLog: {
      findMany: (args: Record<string, unknown>) => {
        findArgs.push(args);
        return adminFind();
      },
      deleteMany: () => adminDelete(),
    },
    securityAuditLog: {
      findMany: () => secFind(),
      deleteMany: () => secDelete(),
    },
  },
}));

const warn = jest.fn();
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn, error: jest.fn(), debug: jest.fn() },
}));

import {
  pruneAuditLogs,
  ADMIN_LOG_RETENTION_DAYS,
  SECURITY_LOG_RETENTION_DAYS,
} from '../../services/auditRetention';

function rows(n: number): Row[] {
  return Array.from({ length: n }, (_, i) => ({ id: `id-${i}` }));
}

beforeEach(() => {
  findArgs.length = 0;
  adminFind.mockReset().mockResolvedValue([]);
  secFind.mockReset().mockResolvedValue([]);
  adminDelete.mockReset().mockResolvedValue({ count: 0 });
  secDelete.mockReset().mockResolvedValue({ count: 0 });
  warn.mockReset();
});

describe('pruneAuditLogs', () => {
  it('keeps security events far longer than routine admin actions', () => {
    // Not a stylistic choice. "Who changed this config in March" stops
    // mattering quickly; "when did the failed-login burst start" is asked
    // during an incident, which is exactly when the record is already old.
    expect(SECURITY_LOG_RETENTION_DAYS).toBeGreaterThan(
      ADMIN_LOG_RETENTION_DAYS
    );
  });

  it('deletes only rows older than the cutoff', async () => {
    adminFind.mockResolvedValueOnce(rows(3)).mockResolvedValue([]);
    adminDelete.mockResolvedValue({ count: 3 });

    await pruneAuditLogs();

    const where = findArgs[0].where as { created_at: { lt: Date } };
    const ageDays =
      (Date.now() - where.created_at.lt.getTime()) / (24 * 60 * 60 * 1000);
    expect(Math.round(ageDays)).toBe(ADMIN_LOG_RETENTION_DAYS);
  });

  it('deletes in bounded batches rather than one unbounded statement', async () => {
    // A single unbounded DELETE takes a long-held lock and one enormous WAL
    // record — a stall for everything else touching the table, including the
    // admin panel that reads it.
    adminFind.mockResolvedValueOnce(rows(1000)).mockResolvedValue([]);
    adminDelete.mockResolvedValue({ count: 1000 });

    await pruneAuditLogs();

    expect(findArgs[0].take).toBe(1000);
    expect(findArgs[0].select).toEqual({ id: true });
  });

  it('stops at the per-run cap and says a backlog remains', async () => {
    // Never returning an empty page: the cap is the only thing that ends it.
    adminFind.mockResolvedValue(rows(1000));
    adminDelete.mockResolvedValue({ count: 1000 });

    const result = await pruneAuditLogs();

    expect(result.moreRemaining).toBe(true);
    expect(warn).toHaveBeenCalled();
    // 50 batches × 1000 — bounded, so one run cannot monopolise the database.
    expect(result.adminLogsDeleted).toBe(50_000);
  });

  it('is a no-op when nothing has aged out', async () => {
    const result = await pruneAuditLogs();

    expect(result).toEqual({
      adminLogsDeleted: 0,
      securityLogsDeleted: 0,
      moreRemaining: false,
    });
    expect(adminDelete).not.toHaveBeenCalled();
    expect(secDelete).not.toHaveBeenCalled();
  });

  it('prunes both trails, not just the admin one', async () => {
    adminFind.mockResolvedValueOnce(rows(2)).mockResolvedValue([]);
    adminDelete.mockResolvedValue({ count: 2 });
    secFind.mockResolvedValueOnce(rows(5)).mockResolvedValue([]);
    secDelete.mockResolvedValue({ count: 5 });

    const result = await pruneAuditLogs();

    expect(result.adminLogsDeleted).toBe(2);
    expect(result.securityLogsDeleted).toBe(5);
  });
});
