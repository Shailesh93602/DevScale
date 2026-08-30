import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * Every RBAC change leaves a record.
 *
 * WHY THIS ROUTER SPECIFICALLY.
 *
 * The audit trail already covered `adminController` — seven actions an admin
 * takes. It did not cover `rbacRoutes` at all, which is eight ADMIN-only
 * endpoints that change WHO IS AN ADMIN. Creating a role, attaching a
 * permission to it, or assigning it to a user rewrites the authorisation model
 * itself, in place, with no other trace: afterwards there is no way to answer
 * "who granted this, and when".
 *
 * That makes these the highest-value rows in the table. Every other entry
 * records something an admin did; these record how someone became able to do
 * it.
 *
 * The guarantee here is BEST-EFFORT, not atomic, and the code says so — these
 * writes go through RBACRepository, which owns its own client. What must not
 * happen is an empty trail being mistaken for "nothing happened", which is why
 * the omission mattered more than the guarantee.
 */

const recordActionBestEffort = jest.fn<(...args: unknown[]) => Promise<void>>();
jest.mock('../../services/auditTrail', () => ({
  __esModule: true,
  recordActionBestEffort: (...args: unknown[]) =>
    recordActionBestEffort(...args),
}));

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const createRole = jest.fn<() => Promise<unknown>>();
const updateRole = jest.fn<() => Promise<unknown>>();
const deleteRole = jest.fn<() => Promise<unknown>>();
const createPermission = jest.fn<() => Promise<unknown>>();
const updatePermission = jest.fn<() => Promise<unknown>>();
const deletePermission = jest.fn<() => Promise<unknown>>();
jest.mock('../../repositories/rbacRepository', () => ({
  __esModule: true,
  RBACRepository: class {
    createRole = createRole;
    updateRole = updateRole;
    delete = deleteRole;
    createPermission = createPermission;
    updatePermission = updatePermission;
    deletePermission = deletePermission;
  },
}));

const assignRole = jest.fn<() => Promise<unknown>>();
jest.mock('../../repositories/userRepository', () => ({
  __esModule: true,
  default: class {
    assignRole = assignRole;
  },
}));

jest.mock('../../middlewares/validateRequest', () => ({
  __esModule: true,
  validateRequest: () => undefined,
}));

import RBACController from '../../controllers/rbacController';

const controller = new RBACController();

type Handler = (
  req: unknown,
  res: unknown,
  next: (e?: unknown) => void
) => Promise<unknown>;

const res = () => ({
  status: () => res(),
  json: () => undefined,
  locals: {},
});

// Returns whatever reached `next`, rather than throwing it — and waits for the
// handler to have actually finished.
//
// Two things about catchAsync make the naive version of this wrong. It routes a
// handler error to next(err) rather than rethrowing, so `rejects.toThrow()`
// silently passes on a resolved promise and proves nothing. And it does NOT
// return the promise (`fn(req,res,next).catch(next)` with no `return`), so
// `await handler(...)` resolves BEFORE the handler has done anything — every
// assertion in this file would otherwise be a race that happens to pass.
//
// Flushing the microtask queue makes both deterministic.
async function call(
  handler: Handler,
  req: Record<string, unknown> = {}
): Promise<unknown> {
  let captured: unknown;
  await handler(
    {
      user: { id: 'admin-7' },
      params: {},
      body: {},
      query: {},
      ip: '10.0.0.9',
      headers: { 'user-agent': 'jest' },
      ...req,
    },
    res(),
    (e?: unknown) => {
      captured = e;
    }
  );
  await new Promise((resolve) => setImmediate(resolve));
  return captured;
}

const entry = () =>
  recordActionBestEffort.mock.calls[0][0] as Record<string, unknown>;

beforeEach(() => {
  jest.clearAllMocks();
  createRole.mockResolvedValue({ id: 'role-1' });
  updateRole.mockResolvedValue({ id: 'role-1' });
  deleteRole.mockResolvedValue(undefined);
  createPermission.mockResolvedValue({ id: 'perm-1' });
  updatePermission.mockResolvedValue({ id: 'perm-1' });
  deletePermission.mockResolvedValue(undefined);
  assignRole.mockResolvedValue({ id: 'user-3' });
});

describe('RBAC changes are recorded', () => {
  const cases: Array<[string, Handler, Record<string, unknown>, string]> = [
    [
      'creating a role',
      controller.createRole as Handler,
      { body: { name: 'AUDITOR' } },
      'CREATE_ROLE',
    ],
    [
      'updating a role',
      controller.updateRole as Handler,
      { params: { roleId: 'role-1' }, body: { name: 'X' } },
      'UPDATE_ROLE',
    ],
    [
      'deleting a role',
      controller.deleteRole as Handler,
      { params: { roleId: 'role-1' } },
      'DELETE_ROLE',
    ],
    [
      'creating a permission',
      controller.createPermission as Handler,
      { body: { resource: 'battle', action: 'delete' } },
      'CREATE_PERMISSION',
    ],
    [
      'updating a permission',
      controller.updatePermission as Handler,
      { params: { permissionId: 'perm-1' }, body: {} },
      'UPDATE_PERMISSION',
    ],
    [
      'deleting a permission',
      controller.deletePermission as Handler,
      { params: { permissionId: 'perm-1' } },
      'DELETE_PERMISSION',
    ],
    [
      'assigning a role to a user',
      controller.assignRoleToUser as Handler,
      { body: { userId: 'user-3', roleId: 'role-1' } },
      'ASSIGN_ROLE_TO_USER',
    ],
  ];

  it.each(cases)('%s', async (_label, handler, req, action) => {
    await call(handler, req);
    expect(recordActionBestEffort).toHaveBeenCalledTimes(1);
    expect(entry()).toMatchObject({ action, admin_id: 'admin-7' });
  });

  it('records WHO and FROM WHERE, not just what', async () => {
    // An entry without an actor answers none of the questions the table is
    // read for. The IP is a hint rather than proof — x-forwarded-for is
    // client-supplied — but nothing authorises on it, and a possibly-spoofed
    // address is more use to a human reconstructing events than none.
    await call(controller.assignRoleToUser as Handler, {
      body: { userId: 'user-3', roleId: 'role-1' },
    });
    expect(entry()).toMatchObject({
      admin_id: 'admin-7',
      entity: 'USER',
      entity_id: 'user-3',
      ip_address: '10.0.0.9',
      details: { roleId: 'role-1' },
    });
  });

  it('records nothing when the change itself failed', async () => {
    // The converse guarantee: a row saying a role was created, when creating it
    // threw, is worse than no row at all.
    createRole.mockRejectedValue(new Error('constraint violation'));
    const err = await call(controller.createRole as Handler, {
      body: { name: 'X' },
    });
    expect(err).toBeInstanceOf(Error);
    expect(recordActionBestEffort).not.toHaveBeenCalled();
  });
});
