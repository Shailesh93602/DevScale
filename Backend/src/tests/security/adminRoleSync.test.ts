import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * Granting ADMIN must not half-apply.
 *
 * THE SITUATION THIS GUARDS.
 *
 * The /admin edge gate reads Supabase `app_metadata.role` and now fails CLOSED
 * — the previous fallback to `user_metadata` was a privilege escalation, since
 * a user can write that field themselves from the browser.
 *
 * Removing a fallback moves risk into whatever depended on it. Here, that is
 * the role-sync: while the fallback existed, a failed sync was survivable
 * because the gate still let the admin in by another route. It no longer does.
 * So a silent sync failure now produces a user the DATABASE calls an admin who
 * cannot open the admin panel — with the API having reported success.
 *
 * A half-applied privilege grant is worse than a refused one, because nobody
 * can tell which half is true.
 */

const update = jest.fn<() => Promise<unknown>>();
const findUnique = jest.fn<() => Promise<unknown>>();
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: () => findUnique(), update: () => update() },
  },
}));

const syncSupabaseUserRole = jest.fn<() => Promise<unknown>>();
jest.mock('../../services/supabaseAdmin', () => ({
  __esModule: true,
  syncSupabaseUserRole: () => syncSupabaseUserRole(),
  isSupabaseAdminConfigured: () => true,
}));

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import UserRepository from '../../repositories/userRepository';

const repo = new UserRepository();

/** The user row the repository reads back after the update. */
function adminUser() {
  findUnique.mockResolvedValue({
    supabase_id: 'sb-1',
    role: { name: 'ADMIN' },
  });
}

beforeEach(() => {
  update.mockReset().mockResolvedValue({ id: 'u1', role_id: 'r-admin' });
  findUnique.mockReset();
  syncSupabaseUserRole.mockReset();
});

describe('granting ADMIN', () => {
  it('succeeds when the claim syncs', async () => {
    adminUser();
    syncSupabaseUserRole.mockResolvedValue({ synced: true });

    await expect(repo.updateUserRole('u1', 'r-admin')).resolves.toMatchObject({
      id: 'u1',
    });
  });

  it('REFUSES when the service key is missing, instead of reporting success', async () => {
    adminUser();
    syncSupabaseUserRole.mockResolvedValue({
      synced: false,
      reason: 'not-configured',
    });

    await expect(repo.updateUserRole('u1', 'r-admin')).rejects.toMatchObject({
      statusCode: 503,
      details: { code: 'ADMIN_CLAIM_NOT_SYNCED' },
    });
  });

  it('REFUSES when Supabase rejects the write', async () => {
    adminUser();
    syncSupabaseUserRole.mockResolvedValue({
      synced: false,
      reason: 'failed',
      detail: 'boom',
    });

    await expect(repo.updateUserRole('u1', 'r-admin')).rejects.toMatchObject({
      statusCode: 503,
    });
  });

  it('keeps the actionable message — the catch-all must not flatten it', async () => {
    // The surrounding try/catch rethrew everything as
    // createAppError('Failed to update user role', 500). A 500's message is
    // then replaced with "Internal server error" in production, so the naming
    // of the exact env var and the exact recovery command would both be lost —
    // the only two things this error exists to say.
    adminUser();
    syncSupabaseUserRole.mockResolvedValue({
      synced: false,
      reason: 'not-configured',
    });

    const err = await repo.updateUserRole('u1', 'r-admin').then(
      () => null,
      (e: Error) => e
    );

    expect(err).not.toBeNull();
    expect(err!.message).toMatch(/SUPABASE_SECRET_KEY/);
    expect(err!.message).not.toMatch(/^Failed to update user role$/);
  });

  it('does NOT refuse a non-admin role whose claim failed to sync', async () => {
    // Nothing gates on STUDENT, so a stale claim costs nothing and blocking a
    // routine demotion would be a worse trade. The strictness is aimed at the
    // one role that grants access.
    findUnique.mockResolvedValue({
      supabase_id: 'sb-1',
      role: { name: 'STUDENT' },
    });
    syncSupabaseUserRole.mockResolvedValue({
      synced: false,
      reason: 'not-configured',
    });

    await expect(repo.updateUserRole('u1', 'r-student')).resolves.toBeTruthy();
  });
});
