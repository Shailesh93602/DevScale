import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * Claim-before-generate.
 *
 * The ordering being tested is the point: claim, then call the LLM, then
 * complete — with a release on failure. The previous ordering generated first,
 * so the loser of a race paid for a full (paid) generation and discarded it.
 *
 * The dangerous cases are not the happy path. They are:
 *   - a failed generation must RELEASE, or the submission is unreviewable
 *   - a stale claim must be takeable, or a crashed process wedges it forever
 *   - two requests both spotting the same stale claim must not BOTH generate
 */

const mockCreate = jest.fn<(args: unknown) => Promise<unknown>>();
const mockFindFirst = jest.fn<(args: unknown) => Promise<unknown>>();
const mockUpdateMany = jest.fn<(args: unknown) => Promise<unknown>>();
const mockDeleteMany = jest.fn<(args: unknown) => Promise<unknown>>();
const mockUpdate = jest.fn<(args: unknown) => Promise<unknown>>();

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    codeReview: {
      create: (a: unknown) => mockCreate(a),
      findFirst: (a: unknown) => mockFindFirst(a),
      updateMany: (a: unknown) => mockUpdateMany(a),
      deleteMany: (a: unknown) => mockDeleteMany(a),
      update: (a: unknown) => mockUpdate(a),
    },
  },
}));

import {
  CodeReviewRepository,
  STALE_CLAIM_MS,
} from '../../repositories/codeReviewRepository';

const input = {
  authorId: 'user-1',
  submissionId: 'sub-1',
  code: 'const a = 1;',
  language: 'typescript',
};

function uniqueViolation(): Error & { code: string } {
  const e = new Error('Unique constraint failed') as Error & { code: string };
  e.code = 'P2002';
  return e;
}

function repo() {
  return new CodeReviewRepository();
}

describe('claimForGeneration', () => {
  beforeEach(() => {
    [mockCreate, mockFindFirst, mockUpdateMany, mockDeleteMany, mockUpdate].forEach(
      (m) => m.mockReset()
    );
  });

  it('claims by INSERT, so the unique index arbitrates', async () => {
    mockCreate.mockResolvedValue({ id: 'review-1' });

    const result = await repo().claimForGeneration(input);

    expect(result).toEqual({ kind: 'claimed', id: 'review-1' });
    // The claim must be written as pending — a claim that looks completed would
    // be served to the next caller as a finished review with empty feedback.
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'pending', source: 'ai' }),
      })
    );
  });

  it('returns the finished review when one already exists', async () => {
    const done = { id: 'r1', status: 'completed', updated_at: new Date() };
    mockCreate.mockRejectedValue(uniqueViolation());
    mockFindFirst.mockResolvedValue(done);

    const result = await repo().claimForGeneration(input);

    expect(result).toEqual({ kind: 'already-complete', review: done });
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it('reports in-progress for a FRESH pending claim — no second generation', async () => {
    mockCreate.mockRejectedValue(uniqueViolation());
    mockFindFirst.mockResolvedValue({
      id: 'r1',
      status: 'pending',
      updated_at: new Date(), // just now
    });

    const result = await repo().claimForGeneration(input);

    expect(result).toEqual({ kind: 'in-progress' });
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  // The wedge. Without takeover, a process that dies between claiming and
  // generating makes the submission permanently unreviewable.
  it('takes over a STALE pending claim', async () => {
    const staleAt = new Date(Date.now() - STALE_CLAIM_MS - 1000);
    mockCreate.mockRejectedValue(uniqueViolation());
    mockFindFirst.mockResolvedValue({
      id: 'r1',
      status: 'pending',
      updated_at: staleAt,
    });
    mockUpdateMany.mockResolvedValue({ count: 1 });

    const result = await repo().claimForGeneration(input);

    expect(result).toEqual({ kind: 'claimed', id: 'r1' });
  });

  it('guards takeover with the row it saw, so two reclaimers do not both win', async () => {
    // Both requests can decide the same claim is stale. The updated_at
    // predicate is inside the mutation precisely so only one takeover applies.
    const staleAt = new Date(Date.now() - STALE_CLAIM_MS - 1000);
    mockCreate.mockRejectedValue(uniqueViolation());
    mockFindFirst.mockResolvedValue({
      id: 'r1',
      status: 'pending',
      updated_at: staleAt,
    });
    mockUpdateMany.mockResolvedValue({ count: 0 }); // someone beat us to it

    const result = await repo().claimForGeneration(input);

    expect(result).toEqual({ kind: 'in-progress' });
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'pending',
          updated_at: staleAt,
        }),
      })
    );
  });

  it('rethrows a non-P2002 error rather than reporting in-progress', async () => {
    const boom = new Error('connection lost') as Error & { code: string };
    boom.code = 'P1001';
    mockCreate.mockRejectedValue(boom);

    await expect(repo().claimForGeneration(input)).rejects.toThrow(
      'connection lost'
    );
  });
});

describe('releaseClaim', () => {
  beforeEach(() => {
    mockDeleteMany.mockReset();
  });

  it('only ever deletes a PENDING row', async () => {
    // Scoping to pending is what stops a late release from destroying a review
    // that completed in the meantime.
    mockDeleteMany.mockResolvedValue({ count: 1 });

    await repo().releaseClaim('r1');

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { id: 'r1', status: 'pending' },
    });
  });
});
