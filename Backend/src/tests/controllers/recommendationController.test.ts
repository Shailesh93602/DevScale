import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

/**
 * The admin reindex endpoint's one input: `force`. Both services are mocked,
 * so no database and no embedding provider is touched. Asserts that the query
 * string `?force=true` and a body `{ force: true }` reach `reindexAll` as
 * `{ force: true }`, and that anything else — including the strings "1",
 * "yes" and "TRUE" — does not: forcing costs one embedding call per active
 * challenge, so it must be an explicit ask.
 */

const mockSendResponse = jest.fn();
jest.mock('../../utils/apiResponse', () => ({
  __esModule: true,
  sendResponse: (...args: unknown[]) => mockSendResponse(...args),
}));

const mockReindexAll = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('../../services/ai/challengeIngestService', () => ({
  __esModule: true,
  ChallengeIngestService: jest.fn().mockImplementation(() => ({
    reindexAll: (...a: unknown[]) => mockReindexAll(...a),
  })),
}));

const mockRecommend = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('../../services/ai/recommendationService', () => ({
  __esModule: true,
  RecommendationService: jest.fn().mockImplementation(() => ({
    recommendChallenges: (...a: unknown[]) => mockRecommend(...a),
  })),
}));

jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
}));
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: { $disconnect: jest.fn() },
}));

import RecommendationController, {
  parseForce,
} from '../../controllers/recommendationController';

const controller = new RecommendationController();

async function reindex(req: Partial<Request>) {
  const res = {} as Response;
  const next = jest.fn() as unknown as NextFunction;
  (
    controller.reindexChallenges as unknown as (
      req: Request,
      res: Response,
      next: NextFunction
    ) => void
  )({ query: {}, body: {}, ...req } as Request, res, next);
  // catchAsync does not return the handler's promise; let it settle.
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
  return next as unknown as jest.Mock;
}

const summary = { total: 2, created: 0, updated: 2, skipped: 0, failed: 0 };

beforeEach(() => {
  mockSendResponse.mockReset();
  mockReindexAll.mockReset();
  mockReindexAll.mockResolvedValue(summary);
});

describe('RecommendationController.reindexChallenges', () => {
  it('reindexes without force by default and returns the summary', async () => {
    await reindex({});
    expect(mockReindexAll).toHaveBeenCalledWith({ force: false });
    expect(mockSendResponse).toHaveBeenCalledWith(
      expect.anything(),
      'CONTENT_REINDEXED',
      { data: summary }
    );
  });

  it('?force=true forces', async () => {
    await reindex({ query: { force: 'true' } as Request['query'] });
    expect(mockReindexAll).toHaveBeenCalledWith({ force: true });
  });

  it('a JSON body { force: true } forces', async () => {
    await reindex({ body: { force: true } });
    expect(mockReindexAll).toHaveBeenCalledWith({ force: true });
  });

  it('forwards a failing reindex to next() rather than hanging', async () => {
    mockReindexAll.mockRejectedValue(new Error('provider down'));
    const next = await reindex({
      query: { force: 'true' } as Request['query'],
    });
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(mockSendResponse).not.toHaveBeenCalled();
  });
});

describe('parseForce', () => {
  const req = (query: unknown, body?: unknown) =>
    ({ query, body }) as unknown as Request;

  it('accepts only the literal string "true" in the query', () => {
    expect(parseForce(req({ force: 'true' }))).toBe(true);
    for (const v of ['TRUE', '1', 'yes', '', 'false', ['true']]) {
      expect(parseForce(req({ force: v }))).toBe(false);
    }
  });

  it('accepts only boolean true in the body', () => {
    expect(parseForce(req({}, { force: true }))).toBe(true);
    for (const v of ['true', 1, 'yes', null, undefined]) {
      expect(parseForce(req({}, { force: v }))).toBe(false);
    }
  });

  it('tolerates a request with no query or body', () => {
    expect(parseForce({} as Request)).toBe(false);
  });
});
