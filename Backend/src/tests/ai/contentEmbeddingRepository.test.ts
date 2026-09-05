import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockExecuteRaw = jest.fn<(...args: unknown[]) => Promise<number>>();
const mockQueryRaw = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    $executeRaw: (...a: unknown[]) => mockExecuteRaw(...a),
    $queryRaw: (...a: unknown[]) => mockQueryRaw(...a),
    $disconnect: jest.fn(),
  },
}));
jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
}));

import { ContentEmbeddingRepository } from '../../repositories/contentEmbeddingRepository';

const repo = new ContentEmbeddingRepository();

beforeEach(() => {
  mockExecuteRaw.mockReset();
  mockQueryRaw.mockReset();
});

describe('ContentEmbeddingRepository', () => {
  it('findSimilar returns the nearest rows', async () => {
    mockQueryRaw.mockResolvedValue([
      { content_id: 'a', distance: 0.05 },
      { content_id: 'b', distance: 0.2 },
    ]);
    const rows = await repo.findSimilar({
      contentType: 'challenge',
      embedding: [0.1, 0.2],
      limit: 2,
    });
    expect(rows).toEqual([
      { content_id: 'a', distance: 0.05 },
      { content_id: 'b', distance: 0.2 },
    ]);
    expect(mockQueryRaw).toHaveBeenCalledTimes(1);
  });

  it('findSimilarToContent queries by the seed item and returns nearest rows', async () => {
    mockQueryRaw.mockResolvedValue([{ content_id: 'x', distance: 0.3 }]);
    const rows = await repo.findSimilarToContent({
      contentType: 'challenge',
      contentId: 'seed-1',
      limit: 3,
      excludeContentIds: ['seed-1', 'done-1'],
    });
    expect(rows).toEqual([{ content_id: 'x', distance: 0.3 }]);
    expect(mockQueryRaw).toHaveBeenCalledTimes(1);
  });

  it('getStoredFingerprint returns hash + model + dimensions when present, null otherwise', async () => {
    mockQueryRaw.mockResolvedValueOnce([
      { content_hash: 'abc', model: 'text-embedding-003', dimensions: 768 },
    ]);
    expect(await repo.getStoredFingerprint('challenge', 'c1')).toEqual({
      contentHash: 'abc',
      model: 'text-embedding-003',
      dimensions: 768,
    });
    // The SELECT reads all three columns — a hash-only read is the bug.
    const [strings] = mockQueryRaw.mock.calls[0] as [TemplateStringsArray];
    const sql = strings.join('?');
    expect(sql).toContain('"content_hash"');
    expect(sql).toContain('"model"');
    expect(sql).toContain('"dimensions"');

    mockQueryRaw.mockResolvedValueOnce([]);
    expect(await repo.getStoredFingerprint('challenge', 'c2')).toBeNull();
  });

  it('getStoredFingerprint coerces a bigint/decimal dimension to a number', async () => {
    mockQueryRaw.mockResolvedValueOnce([
      { content_hash: 'abc', model: 'm', dimensions: BigInt(768) },
    ]);
    const fp = await repo.getStoredFingerprint('challenge', 'c1');
    expect(fp?.dimensions).toBe(768);
    expect(typeof fp?.dimensions).toBe('number');
  });

  it('upsert writes model and dimensions alongside the vector, on insert and on conflict', async () => {
    mockExecuteRaw.mockResolvedValue(1);
    await repo.upsert({
      contentType: 'challenge',
      contentId: 'c1',
      contentHash: 'h',
      embedding: [0.1, 0.2],
      model: 'text-embedding-004',
      dimensions: 768,
    });
    expect(mockExecuteRaw).toHaveBeenCalledTimes(1);
    const [strings, ...values] = mockExecuteRaw.mock.calls[0] as [
      TemplateStringsArray,
      ...unknown[],
    ];
    const sql = strings.join('?');
    expect(sql).toContain('"dimensions"');
    expect(sql).toContain('"dimensions"   = EXCLUDED."dimensions"');
    expect(values).toContain('text-embedding-004');
    expect(values).toContain(768);
  });
});
