import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * The challenge reindex is bounded, concurrent, and survives bad rows.
 *
 * WHY THIS ENDPOINT AND NOT ANOTHER.
 *
 * `POST /recommendations/admin/reindex-challenges` is the call an operator
 * makes ONCE, by hand, after deploying the AI stack — so its failure mode is
 * felt at exactly the moment nobody has context to debug it.
 *
 * The original loaded every active challenge into memory and awaited one
 * ingest per row. Each ingest is two DB round trips plus an embedding API
 * call, so the request cost N × latency inside a single HTTP request: on any
 * hosted runtime that hits the gateway timeout, and the operator gets a 504
 * that says nothing about how much completed. One row throwing lost the whole
 * run.
 *
 * What makes the small fix sufficient — and what these tests pin — is that
 * ingest is IDEMPOTENT (it hashes the text and returns `skipped` when
 * unchanged), so the operation is resumable and a timeout costs a re-run
 * rather than the work.
 */

const findMany = jest.fn<(args: unknown) => Promise<unknown[]>>();
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: { challenge: { findMany: (a: unknown) => findMany(a) } },
}));

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const ingest = jest.fn<(input: unknown) => Promise<{ status: string }>>();
jest.mock('../../services/ai/contentIngestService', () => ({
  __esModule: true,
  ContentIngestService: class {
    ingest = ingest;
  },
}));

import { ChallengeIngestService } from '../../services/ai/challengeIngestService';

const service = new ChallengeIngestService();

const rows = (n: number, offset = 0) =>
  Array.from({ length: n }, (_, i) => ({
    id: `c-${String(offset + i).padStart(4, '0')}`,
    title: 't',
    description: 'd',
    difficulty: 'EASY',
    category: 'x',
    tags: [],
  }));

beforeEach(() => {
  jest.clearAllMocks();
  ingest.mockResolvedValue({ status: 'created' });
});

describe('reindexAll', () => {
  it('pages instead of loading every challenge at once', async () => {
    findMany
      .mockResolvedValueOnce(rows(100))
      .mockResolvedValueOnce(rows(30, 100));

    const result = await service.reindexAll();

    expect(findMany).toHaveBeenCalledTimes(2);
    // The bound is on the QUERY, which is the thing that decides how much is
    // resident — asserting only the total would pass for the unbounded version.
    expect(
      (findMany.mock.calls[0][0] as { take: number }).take
    ).toBe(100);
    expect(result.total).toBe(130);
  });

  it('pages with a stable order and a cursor, so rows are not missed or repeated', async () => {
    findMany
      .mockResolvedValueOnce(rows(100))
      .mockResolvedValueOnce(rows(1, 100));

    await service.reindexAll();

    const second = findMany.mock.calls[1][0] as {
      cursor?: { id: string };
      skip?: number;
      orderBy?: { id: string };
    };
    expect(second.cursor).toEqual({ id: 'c-0099' });
    // skip:1 excludes the cursor row itself — without it the last row of each
    // page is reindexed twice.
    expect(second.skip).toBe(1);
    // Without an explicit order, cursor pagination can revisit or skip rows.
    expect(second.orderBy).toEqual({ id: 'asc' });
  });

  it('stops when a short page comes back, without an extra empty query', async () => {
    findMany.mockResolvedValueOnce(rows(7));
    await service.reindexAll();
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  it('COUNTS a failing row and finishes the run', async () => {
    findMany.mockResolvedValueOnce(rows(4));
    ingest
      .mockResolvedValueOnce({ status: 'created' })
      .mockRejectedValueOnce(new Error('embedding provider said no'))
      .mockResolvedValue({ status: 'created' });

    const result = await service.reindexAll();

    // The point: the other three still got indexed. Throwing here would have
    // discarded completed work that is not free to redo.
    expect(result.failed).toBe(1);
    expect(result.created).toBe(3);
    expect(result.total).toBe(4);
  });

  it('reports skipped rows, which is what makes a re-run cheap', async () => {
    // Idempotence is the property the whole design leans on: if this returned
    // `created` for unchanged content, a timed-out run could not be resumed by
    // simply calling again.
    findMany.mockResolvedValueOnce(rows(3));
    ingest.mockResolvedValue({ status: 'skipped' });

    const result = await service.reindexAll();
    expect(result.skipped).toBe(3);
    expect(result.created).toBe(0);
  });

  it('does not run every row at once', async () => {
    // Unbounded Promise.all over a page would be a different bug in the same
    // place: it bounds memory and then floods the embedding provider.
    let inFlight = 0;
    let peak = 0;
    ingest.mockImplementation(async () => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setImmediate(r));
      inFlight -= 1;
      return { status: 'created' };
    });
    findMany.mockResolvedValueOnce(rows(40));

    await service.reindexAll();

    expect(peak).toBeGreaterThan(1); // it IS concurrent
    expect(peak).toBeLessThanOrEqual(5); // and it is capped
  });
});
