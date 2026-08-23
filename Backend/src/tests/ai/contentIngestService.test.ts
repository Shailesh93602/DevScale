import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockRawEmbed = jest.fn<(text: string) => Promise<number[]>>();
jest.mock('../../services/ai/embeddingProvider', () => ({
  __esModule: true,
  EMBEDDING_MODEL: 'text-embedding-004',
  EMBEDDING_DIMENSIONS: 768,
  isEmbeddingConfigured: () => true,
  rawEmbed: (text: string) => mockRawEmbed(text),
}));

const store = new Map<string, unknown>();
jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
  getCache: async (key: string) => (store.has(key) ? store.get(key) : null),
  setCache: async (
    key: string,
    value: unknown,
    opts?: { prefix?: string }
  ) => {
    store.set(opts?.prefix ? `${opts.prefix}:${key}` : key, value);
  },
}));

const mockGetStoredHash = jest.fn<(...args: unknown[]) => Promise<string | null>>();
const mockUpsert = jest.fn<(...args: unknown[]) => Promise<void>>();
jest.mock('../../repositories/contentEmbeddingRepository', () => ({
  __esModule: true,
  ContentEmbeddingRepository: jest.fn().mockImplementation(() => ({
    getStoredHash: (...a: unknown[]) => mockGetStoredHash(...a),
    upsert: (...a: unknown[]) => mockUpsert(...a),
  })),
}));

import { ContentIngestService } from '../../services/ai/contentIngestService';
import { hashText } from '../../services/ai/embeddingService';

const svc = new ContentIngestService();

beforeEach(() => {
  store.clear();
  mockRawEmbed.mockReset();
  mockGetStoredHash.mockReset();
  mockUpsert.mockReset();
});

describe('ContentIngestService.ingest', () => {
  it('skips embedding when the text is unchanged (idempotent)', async () => {
    const text = 'unchanged content';
    mockGetStoredHash.mockResolvedValue(hashText(text));

    const result = await svc.ingest({
      contentType: 'challenge',
      contentId: 'c1',
      text,
    });

    expect(result.status).toBe('skipped');
    expect(mockRawEmbed).not.toHaveBeenCalled();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('creates a new embedding when none exists', async () => {
    mockGetStoredHash.mockResolvedValue(null);
    mockRawEmbed.mockResolvedValue([0.1, 0.2]);

    const result = await svc.ingest({
      contentType: 'challenge',
      contentId: 'c2',
      text: 'brand new',
    });

    expect(result.status).toBe('created');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: 'challenge',
        contentId: 'c2',
        contentHash: hashText('brand new'),
        embedding: [0.1, 0.2],
        model: 'text-embedding-004',
      })
    );
  });

  it('updates the embedding when the text changed', async () => {
    mockGetStoredHash.mockResolvedValue('a-different-old-hash');
    mockRawEmbed.mockResolvedValue([0.5]);

    const result = await svc.ingest({
      contentType: 'challenge',
      contentId: 'c3',
      text: 'edited content',
    });

    expect(result.status).toBe('updated');
    expect(mockRawEmbed).toHaveBeenCalledTimes(1);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
  });
});
