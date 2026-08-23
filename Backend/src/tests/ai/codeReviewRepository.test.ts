import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * The idempotency guarantee for AI reviews.
 *
 * The repository does findFirst-then-create, which is a check-then-act: two
 * concurrent requests for the same submission both miss the read and both reach
 * the insert. The unique index on (submission_id, source) is what makes that
 * safe — these tests assert the recovery path that turns the loser's constraint
 * violation into the winner's row rather than a 500.
 *
 * Prisma is mocked because the behaviour under test is the ERROR HANDLING, not
 * Postgres. A live-database test of the constraint itself belongs in the
 * integration suite; this one has to be able to force a P2002 on demand, which
 * is hard to schedule against a real database and trivial here.
 */

const mockCreate = jest.fn<(args: unknown) => Promise<unknown>>();
const mockFindFirst = jest.fn<(args: unknown) => Promise<unknown>>();

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    codeReview: {
      create: (args: unknown) => mockCreate(args),
      findFirst: (args: unknown) => mockFindFirst(args),
    },
  },
}));

import { CodeReviewRepository } from '../../repositories/codeReviewRepository';
import type { AiCodeReview } from '../../services/ai/codeReviewService';

const review = {
  score: 80,
  summary: 'looks fine',
} as unknown as AiCodeReview;

const input = {
  authorId: 'user-1',
  submissionId: 'sub-1',
  code: 'const a = 1;',
  language: 'typescript',
  review,
};

/** What Prisma throws when a unique index rejects the insert. */
function uniqueViolation(): Error & { code: string } {
  const error = new Error(
    'Unique constraint failed on the fields: (`submission_id`,`source`)'
  ) as Error & { code: string };
  error.code = 'P2002';
  return error;
}

describe('CodeReviewRepository.createAiReview', () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockFindFirst.mockReset();
  });

  it('returns the created row when it wins the race', async () => {
    const row = { id: 'review-1' };
    mockCreate.mockResolvedValue(row);

    const result = await new CodeReviewRepository().createAiReview(input);

    expect(result).toBe(row);
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  // THE TEST THIS FILE EXISTS FOR.
  //
  // Before the unique index and this recovery, the loser of a concurrent
  // double-submit surfaced a raw Prisma error to a user whose only mistake was
  // double-clicking a slow button.
  it('converges on the winner when it LOSES the race', async () => {
    const winner = { id: 'review-winner' };
    mockCreate.mockRejectedValue(uniqueViolation());
    mockFindFirst.mockResolvedValue(winner);

    const result = await new CodeReviewRepository().createAiReview(input);

    expect(result).toBe(winner);
    expect(mockFindFirst).toHaveBeenCalledTimes(1);
  });

  it('scopes the recovery lookup to this submission and to AI reviews', async () => {
    // Recovering with the wrong filter would hand back somebody else's review —
    // a worse outcome than the error it replaced.
    mockCreate.mockRejectedValue(uniqueViolation());
    mockFindFirst.mockResolvedValue({ id: 'review-winner' });

    await new CodeReviewRepository().createAiReview(input);

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { submission_id: 'sub-1', source: 'ai' },
      })
    );
  });

  it('rethrows a non-P2002 error instead of swallowing it', async () => {
    // A connection failure must not be reported as "already reviewed".
    const boom = new Error('connection lost') as Error & { code: string };
    boom.code = 'P1001';
    mockCreate.mockRejectedValue(boom);

    await expect(
      new CodeReviewRepository().createAiReview(input)
    ).rejects.toThrow('connection lost');
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it('rethrows P2002 if the winner cannot be found', async () => {
    // The row lost the race AND is not there on re-read. That should not be
    // possible, so it must surface rather than return undefined and become a
    // confusing null downstream.
    mockCreate.mockRejectedValue(uniqueViolation());
    mockFindFirst.mockResolvedValue(null);

    await expect(
      new CodeReviewRepository().createAiReview(input)
    ).rejects.toMatchObject({ code: 'P2002' });
  });
});
