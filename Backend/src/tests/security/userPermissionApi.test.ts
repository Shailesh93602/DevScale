import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * Granting and revoking a per-person override.
 *
 * The interesting cases are not the happy path — they are the ones that would
 * otherwise fail quietly: an override that is already expired (accepted
 * silently, it looks like a grant that never worked), an unknown permission key
 * (a typo that produces a row nothing will ever match), and a delete that
 * removed nothing (a false audit entry for an event that did not happen).
 */

const mockPermFindUnique = jest.fn<(...a: unknown[]) => Promise<unknown>>();
const mockUpsert = jest.fn<(...a: unknown[]) => Promise<unknown>>();
const mockDeleteMany = jest.fn<(...a: unknown[]) => Promise<unknown>>();
const mockRecord = jest.fn<(...a: unknown[]) => Promise<void>>();
const mockInvalidate = jest.fn();

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    permission: { findUnique: (...a: unknown[]) => mockPermFindUnique(...a) },
    userPermission: {
      upsert: (...a: unknown[]) => mockUpsert(...a),
      deleteMany: (...a: unknown[]) => mockDeleteMany(...a),
      findMany: jest.fn(),
    },
  },
}));
jest.mock('../../services/auditTrail', () => ({
  __esModule: true,
  recordActionBestEffort: (...a: unknown[]) => mockRecord(...a),
  withAudit: jest.fn(),
}));
jest.mock('../../services/permissionService', () => ({
  __esModule: true,
  invalidatePermissions: (...a: unknown[]) => mockInvalidate(...a),
  getEffectivePermissions: jest.fn(),
  effectiveKeys: jest.fn(),
}));
jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
}));

import RBACController from '../../controllers/rbacController';

const controller = new RBACController();

const res = () => {
  const r: Record<string, unknown> = {};
  r.status = jest.fn(() => r);
  r.json = jest.fn(() => r);
  r.send = jest.fn(() => r);
  return r;
};

const flush = () => new Promise((resolve) => setImmediate(resolve));

/** Returns the error catchAsync forwarded to next(), or null. */
const call = async (handler: unknown, body: Record<string, unknown>) => {
  const next = jest.fn();
  (handler as (a: unknown, b: unknown, c: unknown) => unknown)(
    {
      body,
      params: {},
      query: {},
      user: { id: 'admin-1' },
      headers: {},
      ip: '1.1.1.1',
    },
    res(),
    next
  );
  await flush();
  const err = next.mock.calls[0]?.[0] as
    | { statusCode?: number; message?: string }
    | undefined;
  return err ?? null;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPermFindUnique.mockResolvedValue({ id: 'p1', key: 'articles:moderate' });
  mockUpsert.mockResolvedValue({ id: 'up1' });
  mockDeleteMany.mockResolvedValue({ count: 1 });
  mockRecord.mockResolvedValue(undefined);
});

describe('granting an override', () => {
  it('writes the grant, invalidates the cache, and audits it', async () => {
    const err = await call(controller.setUserPermission, {
      userId: 'u1',
      permissionKey: 'articles:moderate',
      effect: 'ALLOW',
      reason: 'trusted contributor',
    });
    expect(err).toBeNull();
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    // Invalidation is not optional: without it the previous answer stays
    // cached and the grant appears not to work for up to the TTL.
    expect(mockInvalidate).toHaveBeenCalledWith('u1');
    expect(mockRecord).toHaveBeenCalledTimes(1);
  });

  it('records who granted it', async () => {
    await call(controller.setUserPermission, {
      userId: 'u1',
      permissionKey: 'articles:moderate',
    });
    const arg = mockUpsert.mock.calls[0][0] as {
      create: { granted_by: string; effect: string };
    };
    expect(arg.create.granted_by).toBe('admin-1');
    // Default effect is ALLOW, so a caller that omits it grants rather than denies.
    expect(arg.create.effect).toBe('ALLOW');
  });

  it('refuses an already-expired override instead of accepting it silently', async () => {
    const err = await call(controller.setUserPermission, {
      userId: 'u1',
      permissionKey: 'articles:moderate',
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    });
    expect(err?.statusCode).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('refuses an unknown permission key and names the valid ones', async () => {
    mockPermFindUnique.mockResolvedValue(null);
    const err = await call(controller.setUserPermission, {
      userId: 'u1',
      permissionKey: 'articles:moderat', // typo
    });
    expect(err?.statusCode).toBe(400);
    expect(err?.message).toContain('articles:moderate');
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('refuses an effect that is neither ALLOW nor DENY', async () => {
    const err = await call(controller.setUserPermission, {
      userId: 'u1',
      permissionKey: 'articles:moderate',
      effect: 'MAYBE',
    });
    expect(err?.statusCode).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});

describe('removing an override', () => {
  it('deletes, invalidates and audits', async () => {
    const err = await call(controller.removeUserPermission, {
      userId: 'u1',
      permissionKey: 'articles:moderate',
    });
    expect(err).toBeNull();
    expect(mockInvalidate).toHaveBeenCalledWith('u1');
    expect(mockRecord).toHaveBeenCalledTimes(1);
  });

  it('does NOT audit a delete that removed nothing', async () => {
    // A row for an event that did not happen is a false entry, and it cannot be
    // told apart from a real one later — which costs more than the missing row.
    mockDeleteMany.mockResolvedValue({ count: 0 });
    await call(controller.removeUserPermission, {
      userId: 'u1',
      permissionKey: 'articles:moderate',
    });
    expect(mockRecord).not.toHaveBeenCalled();
  });
});
