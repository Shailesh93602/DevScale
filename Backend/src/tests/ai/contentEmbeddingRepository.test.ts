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

  it('getStoredHash returns the hash when present, null otherwise', async () => {
    mockQueryRaw.mockResolvedValueOnce([{ content_hash: 'abc' }]);
    expect(await repo.getStoredHash('challenge', 'c1')).toBe('abc');

    mockQueryRaw.mockResolvedValueOnce([]);
    expect(await repo.getStoredHash('challenge', 'c2')).toBeNull();
  });

  it('upsert issues a write', async () => {
    mockExecuteRaw.mockResolvedValue(1);
    await repo.upsert({
      contentType: 'challenge',
      contentId: 'c1',
      contentHash: 'h',
      embedding: [0.1, 0.2],
      model: 'text-embedding-004',
    });
    expect(mockExecuteRaw).toHaveBeenCalledTimes(1);
  });
});
