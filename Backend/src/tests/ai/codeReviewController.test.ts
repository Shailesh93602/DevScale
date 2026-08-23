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
const mockClaim = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockComplete = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockRelease = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('../../repositories/codeReviewRepository', () => ({
  __esModule: true,
  CodeReviewRepository: jest.fn().mockImplementation(() => ({
    findAiReviewBySubmission: (...a: unknown[]) => mockFind(...a),
    createAiReview: (...a: unknown[]) => mockCreate(...a),
    claimForGeneration: (...a: unknown[]) => mockClaim(...a),
    completeClaim: (...a: unknown[]) => mockComplete(...a),
    releaseClaim: (...a: unknown[]) => mockRelease(...a),
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
  // Returned so a test can assert the ERROR path: catchAsync does not reject,
  // it forwards to next().
  return next as unknown as jest.Mock;
}

beforeEach(() => {
  mockSendResponse.mockReset();
  mockFindUnique.mockReset();
  mockFind.mockReset();
  mockCreate.mockReset();
  mockClaim.mockReset();
  mockComplete.mockReset();
  mockRelease.mockReset();
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
    mockClaim.mockResolvedValue({
      kind: 'already-complete',
      review: { id: 'cr1', feedback: JSON.stringify(review) },
    });
    await invoke({ id: 'u1' });

    expect(mockReview).not.toHaveBeenCalled();
    expect(mockSendResponse).toHaveBeenCalledWith(
      expect.anything(),
      'CODE_REVIEW_FETCHED',
      { data: { id: 'cr1', review } }
    );
  });

  it('generates and persists a new review on the happy path', async () => {
    mockFindUnique.mockResolvedValue(ownedSubmission);
    mockClaim.mockResolvedValue({ kind: 'claimed', id: 'cr2' });
    mockReview.mockResolvedValue(review);
    mockComplete.mockResolvedValue({ id: 'cr2' });
    await invoke({ id: 'u1' });

    expect(mockReview).toHaveBeenCalledTimes(1);
    expect(mockComplete).toHaveBeenCalledWith('cr2', review);
    expect(mockSendResponse).toHaveBeenCalledWith(
      expect.anything(),
      'CODE_REVIEW_CREATED',
      { data: { id: 'cr2', review } }
    );
  });

  // THE POINT OF THE REORDERING. Previously the loser of a race called the LLM
  // and threw the result away — a real paid Gemini call per double-click.
  it('does NOT call the LLM when another request holds the claim', async () => {
    mockFindUnique.mockResolvedValue(ownedSubmission);
    mockClaim.mockResolvedValue({ kind: 'in-progress' });
    await invoke({ id: 'u1' });

    expect(mockReview).not.toHaveBeenCalled();
    expect(mockComplete).not.toHaveBeenCalled();
    expect(mockSendResponse).toHaveBeenCalledWith(
      expect.anything(),
      'CODE_REVIEW_IN_PROGRESS'
    );
  });

  // Without the release, a failed generation leaves a `pending` row and the
  // submission is unreviewable until the claim goes stale — for an error the
  // user could retry immediately.
  it('releases the claim when generation fails, and rethrows', async () => {
    mockFindUnique.mockResolvedValue(ownedSubmission);
    mockClaim.mockResolvedValue({ kind: 'claimed', id: 'cr3' });
    mockReview.mockRejectedValue(new Error('gemini exploded'));
    mockRelease.mockResolvedValue(undefined);

    const next = await invoke({ id: 'u1' });

    // catchAsync forwards to next() rather than rejecting, so the error is
    // asserted there.
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'gemini exploded' })
    );
    expect(mockRelease).toHaveBeenCalledWith('cr3');
    expect(mockComplete).not.toHaveBeenCalled();
  });
});
