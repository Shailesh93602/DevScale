import { describe, it, expect, jest } from '@jest/globals';

/**
 * The resolution matrix: role defaults, per-user overrides, and who wins.
 *
 * `decide` is pure, so the precedence rules can be tested exhaustively without
 * a database. That matters because precedence is the part nobody can hold in
 * their head — and the part where being wrong is silent: an override that does
 * not take effect looks exactly like an override nobody applied.
 */

jest.mock('../../lib/prisma', () => ({ __esModule: true, default: {} }));
jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
}));

import {
  decide,
  effectiveKeys,
  type EffectivePermissions,
} from '../../services/permissionService';
import { SUPERUSER } from '../../constants/permissions';

const build = (p: {
  role?: string[];
  allow?: string[];
  deny?: string[];
}): EffectivePermissions => ({
  userId: 'u1',
  roleName: 'TEST',
  fromRole: new Set(p.role ?? []),
  allowed: new Set(p.allow ?? []),
  denied: new Set(p.deny ?? []),
});

describe('role defaults', () => {
  it('permits what the role grants', () => {
    expect(
      decide(build({ role: ['articles:moderate'] }), 'articles:moderate')
    ).toBe(true);
  });

  it('refuses what the role does not grant', () => {
    expect(
      decide(build({ role: ['articles:read'] }), 'articles:moderate')
    ).toBe(false);
  });

  it('refuses everything for a user with no role', () => {
    expect(decide(build({}), 'articles:read')).toBe(false);
  });

  it('the superuser wildcard permits anything', () => {
    expect(decide(build({ role: [SUPERUSER] }), 'anything:at:all')).toBe(true);
  });
});

describe('per-user overrides', () => {
  it('ALLOW grants a permission the role does not have', () => {
    // The headline case: one trusted student given one extra power, without
    // inventing a role for them and without widening STUDENT for everybody.
    const student = build({ role: [], allow: ['articles:moderate'] });
    expect(decide(student, 'articles:moderate')).toBe(true);
    expect(decide(student, 'articles:delete')).toBe(false);
  });

  it('DENY removes a permission the role DOES have', () => {
    // The other direction, and the one an additive-only model cannot express.
    const moderator = build({
      role: ['articles:moderate', 'forums:moderate'],
      deny: ['forums:moderate'],
    });
    expect(decide(moderator, 'articles:moderate')).toBe(true);
    expect(decide(moderator, 'forums:moderate')).toBe(false);
  });

  it('DENY beats an explicit ALLOW for the same key', () => {
    const both = build({ allow: ['tickets:update'], deny: ['tickets:update'] });
    expect(decide(both, 'tickets:update')).toBe(false);
  });

  it('DENY beats the superuser wildcard', () => {
    // An admin with an explicit deny is a deliberate state, not an accident —
    // otherwise "remove this one capability from this one admin" would be
    // impossible without demoting them.
    const admin = build({ role: [SUPERUSER], deny: ['users:manage'] });
    expect(decide(admin, 'users:manage')).toBe(false);
    expect(decide(admin, 'reports:read')).toBe(true);
  });

  it('a blanket DENY of * refuses everything, even with a role grant', () => {
    const suspended = build({ role: ['articles:read'], deny: [SUPERUSER] });
    expect(decide(suspended, 'articles:read')).toBe(false);
  });

  it('an ALLOW of * grants everything short of an explicit deny', () => {
    const elevated = build({ allow: [SUPERUSER], deny: ['users:manage'] });
    expect(decide(elevated, 'reports:read')).toBe(true);
    expect(decide(elevated, 'users:manage')).toBe(false);
  });
});

describe('effectiveKeys — what the UI renders against', () => {
  const catalogue = [
    SUPERUSER,
    'articles:read',
    'articles:moderate',
    'forums:moderate',
    'users:manage',
  ];

  it('expands the wildcard into concrete keys and drops the wildcard itself', () => {
    const keys = effectiveKeys(build({ role: [SUPERUSER] }), catalogue);
    expect(keys).toEqual([
      'articles:moderate',
      'articles:read',
      'forums:moderate',
      'users:manage',
    ]);
    expect(keys).not.toContain(SUPERUSER);
  });

  it('reflects overrides, so the UI cannot show a power the API would refuse', () => {
    // A menu offering an action the server will 403 is worse than hiding it:
    // the user reports a bug, and the real problem is two sources of truth.
    const keys = effectiveKeys(
      build({
        role: ['articles:read'],
        allow: ['forums:moderate'],
        deny: ['articles:read'],
      }),
      catalogue
    );
    expect(keys).toEqual(['forums:moderate']);
  });
});
