import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';

/**
 * GET /rbac/check-permission — the one route on the RBAC router that is
 * deliberately open to every authenticated user, because the UI uses it to
 * decide what to render for the current user.
 *
 * It took `userId` from the QUERY STRING and never checked it against the
 * caller, so any signed-in user could ask about anyone else's permissions and
 * map the authorisation model account by account. The route's own comment said
 * "their own permissions"; the handler never enforced it.
 *
 * Found by the route-contract test, which flagged the route as ungated and
 * forced the question of whether that was intentional. It was — but only under
 * an assumption the code did not implement.
 */

const checkPermission = jest.fn<() => Promise<boolean>>();
jest.mock('../../repositories/rbacRepository', () => ({
  __esModule: true,
  RBACRepository: class {
    checkPermission = () => checkPermission();
  },
}));

import RBACController from '../../controllers/rbacController';

const controller = new RBACController();

function reqAs(
  caller: { id: string; role?: string } | null,
  query: Record<string, string>
): Request {
  return {
    user: caller
      ? { id: caller.id, role: { name: caller.role ?? 'STUDENT' } }
      : undefined,
    query,
  } as unknown as Request;
}

// `status()` must be chainable — sendResponse does res.status(...).json(...),
// and a non-chaining stub fails with "cannot read properties of undefined",
// which looks like a handler bug rather than a mock bug.
const json = jest.fn();
const res = {
  status: jest.fn(() => res),
  json,
  setHeader: jest.fn(),
  send: jest.fn(),
} as unknown as Response;

/** Invoke the catchAsync-wrapped handler and surface whatever it threw. */
async function invoke(req: Request): Promise<Error | null> {
  return new Promise((resolve) => {
    const next = (err?: unknown) => resolve((err as Error) ?? null);
    (
      controller.checkPermission as unknown as (
        q: Request,
        s: Response,
        n: (e?: unknown) => void
      ) => void
    )(req, res, next);
    // catchAsync resolves next() asynchronously on success too.
    setTimeout(() => resolve(null), 20);
  });
}

beforeEach(() => {
  checkPermission.mockReset().mockResolvedValue(true);
});

describe('checkPermission', () => {
  it('REFUSES a student asking about somebody else — the disclosure itself', async () => {
    const err = await invoke(
      reqAs(
        { id: 'me' },
        { userId: 'someone-else', resource: 'roadmap', action: 'delete' }
      )
    );

    expect(err).not.toBeNull();
    expect(err).toMatchObject({ statusCode: 403 });
    // And it must not have reached the repository at all.
    expect(checkPermission).not.toHaveBeenCalled();
  });

  it('allows a student asking about themselves', async () => {
    const err = await invoke(
      reqAs({ id: 'me' }, { userId: 'me', resource: 'roadmap', action: 'view' })
    );

    expect(err).toBeNull();
    expect(checkPermission).toHaveBeenCalled();
  });

  it('allows an ADMIN to ask about anyone — administering roles requires it', async () => {
    const err = await invoke(
      reqAs(
        { id: 'admin-1', role: 'ADMIN' },
        { userId: 'someone-else', resource: 'roadmap', action: 'delete' }
      )
    );

    expect(err).toBeNull();
    expect(checkPermission).toHaveBeenCalled();
  });

  it('answers a missing parameter with 400, not a 500', async () => {
    // It threw a bare Error, which becomes a 500 — and a 500's message is
    // replaced with "Internal server error" in production, so the caller
    // learned nothing about a mistake that was entirely theirs to fix.
    const err = await invoke(reqAs({ id: 'me' }, { userId: 'me' }));

    expect(err).toMatchObject({ statusCode: 400 });
  });
});
