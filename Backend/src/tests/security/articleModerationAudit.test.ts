import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * Moderation decisions leave an audit trail.
 *
 * Publishing, rejecting or editing somebody else's article is a privileged act
 * performed on another person's work — the class of action most likely to be
 * questioned weeks later ("who took this down, and when?"). The admin panel
 * and the RBAC controller both recorded their actions; the article moderation
 * endpoints, which are the entire purpose of the /moderate screen, recorded
 * nothing at all.
 *
 * These assert the OUTCOME — that a row is recorded, naming the actor, the
 * entity and the change — rather than that the handler returns 200. A handler
 * that responds correctly and records nothing is exactly the bug.
 */

const mockRecord = jest
  .fn<(...args: unknown[]) => Promise<void>>()
  .mockResolvedValue(undefined);
const mockGetArticleById = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockUpdateArticle = jest.fn<(...args: unknown[]) => Promise<unknown>>();

jest.mock('../../services/auditTrail', () => ({
  __esModule: true,
  recordActionBestEffort: (...a: unknown[]) => mockRecord(...a),
  withAudit: jest.fn(),
}));
jest.mock('../../repositories/articleRepository', () => ({
  __esModule: true,
  ArticleRepository: class {
    getArticleById = (...a: unknown[]) => mockGetArticleById(...a);
    updateArticle = (...a: unknown[]) => mockUpdateArticle(...a);
  },
}));
jest.mock('../../lib/prisma', () => ({ __esModule: true, default: {} }));
jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
}));

import ArticleController from '../../controllers/articleController';

const controller = new ArticleController();

type AuditEntry = {
  admin_id: string;
  action: string;
  entity: string;
  entity_id: string;
  details?: Record<string, unknown>;
};

const entry = (): AuditEntry => mockRecord.mock.calls[0][0] as AuditEntry;

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
  mockGetArticleById.mockResolvedValue({
    id: 'a1',
    status: 'PENDING',
    author_id: 'author-9',
    content: 'body',
  });
  mockUpdateArticle.mockResolvedValue({ id: 'a1' });
});

describe('article moderation writes an audit row', () => {
  it('records a status change with the actor and BOTH values', async () => {
    await run(controller.updateArticleStatus, {
      body: { articleId: 'a1', status: 'PUBLISHED' },
      user: { id: 'mod-1' },
      headers: { 'user-agent': 'jest' },
      ip: '10.0.0.1',
      params: {},
    });

    expect(mockRecord).toHaveBeenCalledTimes(1);
    const e = entry();
    expect(e.action).toBe('UPDATE_ARTICLE_STATUS');
    expect(e.entity_id).toBe('a1');
    expect(e.admin_id).toBe('mod-1');
    // The previous value is the half that makes the row answerable later:
    // "changed to PUBLISHED" does not say what it was taken away from.
    expect(e.details).toMatchObject({ from: 'PENDING', to: 'PUBLISHED' });
  });

  it('records a moderation action', async () => {
    await run(controller.updateModerationNotes, {
      params: { id: 'a1' },
      body: { notes: 'off-topic', action: 'REJECT' },
      user: { id: 'mod-2' },
      headers: {},
      ip: '10.0.0.2',
    });

    const e = entry();
    expect(e.action).toBe('MODERATE_ARTICLE');
    expect(e.admin_id).toBe('mod-2');
    expect(e.details).toMatchObject({ moderationAction: 'REJECT' });
  });

  it('records a content edit by field name, never the content itself', async () => {
    await run(controller.updateArticleContent, {
      params: { id: 'a1' },
      body: { title: 'New title', content: 'Rewritten body text' },
      user: { id: 'mod-3' },
      headers: {},
      ip: '10.0.0.3',
    });

    const e = entry();
    expect(e.action).toBe('EDIT_ARTICLE_CONTENT');
    expect(e.details).toMatchObject({
      fieldsChanged: ['title', 'content'],
      authorId: 'author-9',
    });
    // An audit table is retained for a long time and read by more people than
    // the request was, so it must not become a second copy of the article body.
    expect(JSON.stringify(e.details)).not.toContain('Rewritten body text');
  });

  it('does not record when the article does not exist', async () => {
    mockGetArticleById.mockResolvedValue(null);
    await run(controller.updateArticleStatus, {
      body: { articleId: 'missing', status: 'PUBLISHED' },
      user: { id: 'mod-1' },
      headers: {},
      ip: '10.0.0.1',
      params: {},
    });
    // A row for a change that never happened is a false record, which is worse
    // than a missing one — it cannot be distinguished from a real event.
    expect(mockRecord).not.toHaveBeenCalled();
    expect(mockUpdateArticle).not.toHaveBeenCalled();
  });
});
