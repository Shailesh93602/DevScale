import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * The two content mutations that act on OTHER people's experience.
 *
 * Not every privileged write needs an audit row. Creating your own roadmap, or
 * editing a record you own, is already fully described by the row itself — it
 * carries the owner and the timestamps, and a log entry would only duplicate
 * them while doubling writes.
 *
 * These two are different:
 *
 *  - A challenge body contains its TEST CASES. Editing one silently changes
 *    whether everybody else's submissions pass, and nothing in the challenge
 *    row records who last moved that goalpost.
 *  - Deleting a forum thread is ADMIN-gated with no ownership check, so it
 *    removes somebody else's discussion — and the deleted row was the only
 *    other evidence it ever existed. Without a record, "who deleted my thread"
 *    has no answer at all after the fact.
 */

const mockRecord = jest
  .fn<(...args: unknown[]) => Promise<void>>()
  .mockResolvedValue(undefined);
const mockChallengeCreate = jest.fn<(...a: unknown[]) => Promise<unknown>>();
const mockChallengeUpdate = jest.fn<(...a: unknown[]) => Promise<unknown>>();
const mockForumFindUnique = jest.fn<(...a: unknown[]) => Promise<unknown>>();
const mockForumDelete = jest.fn<(...a: unknown[]) => Promise<unknown>>();

jest.mock('../../services/auditTrail', () => ({
  __esModule: true,
  recordActionBestEffort: (...a: unknown[]) => mockRecord(...a),
  withAudit: jest.fn(),
}));
jest.mock('../../repositories/challengeRepository', () => ({
  __esModule: true,
  ChallengeRepository: class {
    create = (...a: unknown[]) => mockChallengeCreate(...a);
    update = (...a: unknown[]) => mockChallengeUpdate(...a);
  },
}));
jest.mock('../../repositories/forumRepository', () => ({
  __esModule: true,
  ForumRepository: class {
    findUnique = (...a: unknown[]) => mockForumFindUnique(...a);
    delete = (...a: unknown[]) => mockForumDelete(...a);
  },
}));
jest.mock('../../utils/sanitize', () => ({
  __esModule: true,
  sanitizeText: (v: string) => v,
  sanitizeRichText: (v: string) => v,
}));
jest.mock('../../lib/prisma', () => ({ __esModule: true, default: {} }));
jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
}));

import ChallengeController from '../../controllers/challengeController';
import CommunityForumController from '../../controllers/communityForumControllers';

type AuditEntry = {
  admin_id: string;
  action: string;
  entity: string;
  entity_id: string;
  details?: Record<string, unknown>;
};
const entry = () => mockRecord.mock.calls[0][0] as AuditEntry;

const res = () => {
  const r: Record<string, unknown> = {};
  r.status = jest.fn(() => r);
  r.json = jest.fn(() => r);
  r.send = jest.fn(() => r);
  return r;
};

/**
 * Wait for the handler to actually finish.
 *
 * `catchAsync` is `(req,res,next) => { fn(...).catch(next); }` — it does NOT
 * return the promise, so awaiting the call resolves immediately while the
 * handler is still running. Assertions made straight after it race the code
 * they are testing: they pass or fail on microtask ordering, which is how a
 * test ends up green for a handler that never ran. Flushing the queue makes
 * the wait real.
 */
const flush = () => new Promise((resolve) => setImmediate(resolve));

const run = async (handler: unknown, req: Record<string, unknown>) => {
  (handler as (a: unknown, b: unknown, c: unknown) => Promise<void>)(
    req,
    res(),
    jest.fn()
  );
  await flush();
};

beforeEach(() => {
  jest.clearAllMocks();
  mockChallengeCreate.mockResolvedValue({ id: 'ch1' });
  mockChallengeUpdate.mockResolvedValue({ id: 'ch1' });
});

describe('challenge mutations are recorded', () => {
  const controller = new ChallengeController();

  it('records creation with the actor', async () => {
    await run(controller.createNewChallenge, {
      body: { title: 'Two Sum', testCases: [{ in: 1, out: 2 }] },
      user: { id: 'admin-1' },
      headers: {},
      ip: '10.0.0.1',
      params: {},
    });

    const e = entry();
    expect(e.action).toBe('CREATE_CHALLENGE');
    expect(e.entity_id).toBe('ch1');
    expect(e.admin_id).toBe('admin-1');
  });

  it('records an edit by field NAME, never the test cases themselves', async () => {
    await run(controller.updateExistingChallenge, {
      params: { id: 'ch1' },
      body: { testCases: [{ in: 41, out: 'SECRET_EXPECTED_OUTPUT' }] },
      user: { id: 'admin-2' },
      headers: {},
      ip: '10.0.0.2',
    });

    const e = entry();
    expect(e.action).toBe('UPDATE_CHALLENGE');
    expect(e.details).toMatchObject({ fieldsChanged: ['testCases'] });
    // Copying expected outputs into a long-lived audit table would make the
    // answers readable to anyone with audit access — a different leak from the
    // one the audit exists to prevent.
    expect(JSON.stringify(e.details)).not.toContain('SECRET_EXPECTED_OUTPUT');
  });
});

describe("deleting somebody else's forum thread is recorded", () => {
  const controller = new CommunityForumController();

  it('records the deleter AND the author whose thread was removed', async () => {
    mockForumFindUnique.mockResolvedValue({
      id: 'f1',
      title: 'Why is my submission failing?',
      created_by: 'student-7',
    });
    mockForumDelete.mockResolvedValue({});

    await run(controller.deleteForum, {
      params: { id: 'f1' },
      user: { id: 'admin-3' },
      headers: {},
      ip: '10.0.0.3',
      body: {},
    });

    const e = entry();
    expect(e.action).toBe('DELETE_FORUM');
    expect(e.entity_id).toBe('f1');
    expect(e.admin_id).toBe('admin-3');
    // The author is the half that makes it answerable: after the row is gone,
    // this record is the only thing that knows whose thread it was.
    expect(e.details).toMatchObject({ authorId: 'student-7' });
  });

  it('records nothing when the thread does not exist', async () => {
    mockForumFindUnique.mockResolvedValue(null);
    await run(controller.deleteForum, {
      params: { id: 'missing' },
      user: { id: 'admin-3' },
      headers: {},
      ip: '10.0.0.3',
      body: {},
    });
    expect(mockForumDelete).not.toHaveBeenCalled();
    expect(mockRecord).not.toHaveBeenCalled();
  });
});
