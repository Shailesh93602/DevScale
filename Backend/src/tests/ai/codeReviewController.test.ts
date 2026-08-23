import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
} from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

/**
 * Controller branch tests — prisma, the repository, and the review service are
 * all mocked, so NO database is touched (the local DATABASE_URL points at prod
 * Supabase). Asserts auth/ownership/idempotency and the create path.
 */

const mockSendResponse = jest.fn();
jest.mock('../../utils/apiResponse', () => ({
  __esModule: true,
  sendResponse: (...args: unknown[]) => mockSendResponse(...args),
}));

const mockFindUnique = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    challengeSubmission: { findUnique: (...a: unknown[]) => mockFindUnique(...a) },
    $disconnect: jest.fn(), // jest-setup.ts calls this in its global afterAll
  },
}));

const mockFind = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockCreate = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('../../repositories/codeReviewRepository', () => ({
  __esModule: true,
  CodeReviewRepository: jest.fn().mockImplementation(() => ({
    findAiReviewBySubmission: (...a: unknown[]) => mockFind(...a),
    createAiReview: (...a: unknown[]) => mockCreate(...a),
  })),
}));

const mockReview = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('../../services/ai/codeReviewService', () => ({
  __esModule: true,
  reviewCodeSubmission: (...a: unknown[]) => mockReview(...a),
}));

jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
}));
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import CodeReviewController from '../../controllers/codeReviewController';

const review = {
  summary: 's',
  correctness: { verdict: 'correct', explanation: 'e' },
  complexity: { time: 'O(n)', space: 'O(1)' },
  edge_cases_missed: [],
  improvements: [],
  score: 90,
};

const ownedSubmission = {
  id: 's1',
  user_id: 'u1',
  code: 'code',
  language: 'javascript',
  status: 'accepted',
  runtime_ms: 12,
  memory_used_kb: 100,
  challenge: { title: 'T', description: 'D' },
};

function makeReqRes(user: { id: string } | undefined) {
  const req = { user, params: { submissionId: 's1' } } as unknown as Request;
  const res = {} as Response;
  const next = jest.fn() as unknown as NextFunction;
  return { req, res, next };
}

const controller = new CodeReviewController();

async function invoke(user: { id: string } | undefined) {
  const { req, res, next } = makeReqRes(user);
  (
    controller.reviewChallengeSubmission as unknown as (
      req: Request,
      res: Response,
      next: NextFunction
    ) => void
  )(req, res, next);
  // catchAsync runs the handler but does NOT return its promise, so flush the
  // queue a few times to let the awaited handler chain settle before asserting.
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
}

beforeEach(() => {
  mockSendResponse.mockReset();
  mockFindUnique.mockReset();
  mockFind.mockReset();
  mockCreate.mockReset();
  mockReview.mockReset();
});

describe('CodeReviewController.reviewChallengeSubmission', () => {
  it('rejects an unauthenticated request', async () => {
    await invoke(undefined);
    expect(mockSendResponse).toHaveBeenCalledWith(
      expect.anything(),
      'UNAUTHORIZED'
    );
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('returns NOT_FOUND when the submission does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);
    await invoke({ id: 'u1' });
    expect(mockSendResponse).toHaveBeenCalledWith(
      expect.anything(),
      'NOT_FOUND'
    );
  });

  it('forbids reviewing another user’s submission', async () => {
    mockFindUnique.mockResolvedValue({ ...ownedSubmission, user_id: 'someone-else' });
    await invoke({ id: 'u1' });
    expect(mockSendResponse).toHaveBeenCalledWith(
      expect.anything(),
      'FORBIDDEN'
    );
    expect(mockReview).not.toHaveBeenCalled();
  });

  it('is idempotent — returns the existing review without re-calling the LLM', async () => {
    mockFindUnique.mockResolvedValue(ownedSubmission);
    mockFind.mockResolvedValue({ id: 'cr1', feedback: JSON.stringify(review) });
    await invoke({ id: 'u1' });

    expect(mockReview).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockSendResponse).toHaveBeenCalledWith(
      expect.anything(),
      'CODE_REVIEW_FETCHED',
      { data: { id: 'cr1', review } }
    );
  });

  it('generates and persists a new review on the happy path', async () => {
    mockFindUnique.mockResolvedValue(ownedSubmission);
    mockFind.mockResolvedValue(null);
    mockReview.mockResolvedValue(review);
    mockCreate.mockResolvedValue({ id: 'cr2' });
    await invoke({ id: 'u1' });

    expect(mockReview).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: 'u1',
        submissionId: 's1',
        review,
      })
    );
    expect(mockSendResponse).toHaveBeenCalledWith(
      expect.anything(),
      'CODE_REVIEW_CREATED',
      { data: { id: 'cr2', review } }
    );
  });
});
