// eduscale-backend#24-13 — Role.permissions is a join table; ids must become join rows.
import { describe, it, expect, jest } from '@jest/globals';

const calls: Array<{ op: string; args: unknown }> = [];
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    role: {
      create: async (args: unknown) => (calls.push({ op: 'create', args }), {}),
      update: async (args: unknown) => (calls.push({ op: 'update', args }), {}),
    },
  },
}));

import type { Prisma } from '@prisma/client';
import { RBACRepository } from '../../repositories/rbacRepository';

const rows = [
  { permission: { connect: { id: 'p1' } } },
  { permission: { connect: { id: 'p2' } } },
];

describe('RBACRepository role permissions', () => {
  it('createRole creates RolePermission rows connected to each Permission', async () => {
    await new RBACRepository().createRole({
      name: 'EDITOR',
      permissions: ['p1', 'p2'],
    });
    expect(calls.pop()).toEqual({
      op: 'create',
      args: {
        data: {
          name: 'EDITOR',
          permissions: { create: rows },
        } satisfies Prisma.RoleCreateInput,
      },
    });
  });

  it('updateRole replaces the join rows instead of `set`-ing permission ids', async () => {
    await new RBACRepository().updateRole('r1', { permissions: ['p1', 'p2'] });
    expect(calls.pop()).toEqual({
      op: 'update',
      args: {
        where: { id: 'r1' },
        data: {
          permissions: { deleteMany: {}, create: rows },
        } satisfies Prisma.RoleUpdateInput,
      },
    });
  });
});
