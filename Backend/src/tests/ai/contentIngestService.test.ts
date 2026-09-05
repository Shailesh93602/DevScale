import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * The ingest skip is a FINGERPRINT check, not a hash check.
 *
 * The first version skipped whenever the stored content hash matched. An
 * embedding is a function of the text and the model, so after a change of
 * `GEMINI_EMBEDDING_MODEL` every unchanged text still matched its hash, was
 * reported `skipped`, and kept the old model's vector — one pgvector table,
 * two embedding spaces. These tests pin the three-part fingerprint
 * (hash, model, dimensions) and the `force` bypass.
 */

// embedText resolves a key before embedding; whose key it is, and what happens
// when there isn't one, belong to resolveApiKey's own tests. Ingest only needs
// the resolution to succeed.
jest.mock('../../services/ai/resolveApiKey', () => ({
  __esModule: true,
  requireApiKey: async () => ({
    apiKey: 'test-key',
    fingerprint: 'test-fp',
    kind: 'user',
  }),
}));

const CURRENT_MODEL = 'text-embedding-004';
const CURRENT_DIMENSIONS = 768;

const mockRawEmbed = jest.fn<(text: string) => Promise<number[]>>();
jest.mock('../../services/ai/embeddingProvider', () => ({
  __esModule: true,
  EMBEDDING_MODEL: CURRENT_MODEL,
  EMBEDDING_DIMENSIONS: CURRENT_DIMENSIONS,
  isEmbeddingConfigured: () => true,
  rawEmbed: (text: string) => mockRawEmbed(text),
}));

const store = new Map<string, unknown>();
jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
  getCache: async (key: string) => (store.has(key) ? store.get(key) : null),
  setCache: async (key: string, value: unknown, opts?: { prefix?: string }) => {
    store.set(opts?.prefix ? `${opts.prefix}:${key}` : key, value);
  },
}));

type Fingerprint = {
  contentHash: string;
  model: string;
  dimensions: number;
} | null;
const mockGetStoredFingerprint =
  jest.fn<(...args: unknown[]) => Promise<Fingerprint>>();
const mockUpsert = jest.fn<(...args: unknown[]) => Promise<void>>();
jest.mock('../../repositories/contentEmbeddingRepository', () => ({
  __esModule: true,
  ContentEmbeddingRepository: jest.fn().mockImplementation(() => ({
    getStoredFingerprint: (...a: unknown[]) => mockGetStoredFingerprint(...a),
    upsert: (...a: unknown[]) => mockUpsert(...a),
  })),
}));

import { ContentIngestService } from '../../services/ai/contentIngestService';
import { hashText } from '../../services/ai/embeddingService';

const svc = new ContentIngestService();

const stored = (text: string, over: Partial<NonNullable<Fingerprint>> = {}) =>
  ({
    contentHash: hashText(text),
    model: CURRENT_MODEL,
    dimensions: CURRENT_DIMENSIONS,
    ...over,
  }) as NonNullable<Fingerprint>;

beforeEach(() => {
  store.clear();
  mockRawEmbed.mockReset();
  mockGetStoredFingerprint.mockReset();
  mockUpsert.mockReset();
});

describe('ContentIngestService.ingest', () => {
  it('skips embedding when text, model and dimensions are all unchanged (idempotent)', async () => {
    const text = 'unchanged content';
    mockGetStoredFingerprint.mockResolvedValue(stored(text));

    const result = await svc.ingest({
      contentType: 'challenge',
      contentId: 'c1',
      text,
    });

    expect(result.status).toBe('skipped');
    expect(mockRawEmbed).not.toHaveBeenCalled();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('creates a new embedding when none exists, stamping model and dimensions', async () => {
    mockGetStoredFingerprint.mockResolvedValue(null);
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
        model: CURRENT_MODEL,
        dimensions: CURRENT_DIMENSIONS,
      })
    );
  });

  it('updates the embedding when the text changed', async () => {
    mockGetStoredFingerprint.mockResolvedValue(stored('the previous wording'));
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

  it('re-embeds an UNCHANGED text when the stored row came from a different model', async () => {
    const text = 'same words, older model';
    mockGetStoredFingerprint.mockResolvedValue(
      stored(text, { model: 'text-embedding-003' })
    );
    mockRawEmbed.mockResolvedValue([0.9]);

    const result = await svc.ingest({
      contentType: 'challenge',
      contentId: 'c4',
      text,
    });

    // The bug: this used to be `skipped`, leaving the row on the old model.
    expect(result.status).toBe('updated');
    expect(mockRawEmbed).toHaveBeenCalledTimes(1);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        contentHash: hashText(text),
        model: CURRENT_MODEL,
        dimensions: CURRENT_DIMENSIONS,
      })
    );
  });

  it('re-embeds an unchanged text when the stored dimension differs', async () => {
    const text = 'same words, other width';
    mockGetStoredFingerprint.mockResolvedValue(
      stored(text, { dimensions: 1536 })
    );
    mockRawEmbed.mockResolvedValue([0.4]);

    const result = await svc.ingest({
      contentType: 'challenge',
      contentId: 'c5',
      text,
    });

    expect(result.status).toBe('updated');
    expect(mockRawEmbed).toHaveBeenCalledTimes(1);
  });

  it('force re-embeds even when the whole fingerprint matches', async () => {
    const text = 'fingerprint matches exactly';
    mockGetStoredFingerprint.mockResolvedValue(stored(text));
    mockRawEmbed.mockResolvedValue([0.7]);

    const result = await svc.ingest(
      { contentType: 'challenge', contentId: 'c6', text },
      undefined,
      { force: true }
    );

    expect(result.status).toBe('updated');
    expect(mockRawEmbed).toHaveBeenCalledTimes(1);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
  });

  it('force: false is the default and still skips a current row', async () => {
    const text = 'explicitly not forced';
    mockGetStoredFingerprint.mockResolvedValue(stored(text));

    const result = await svc.ingest(
      { contentType: 'challenge', contentId: 'c7', text },
      undefined,
      { force: false }
    );

    expect(result.status).toBe('skipped');
    expect(mockRawEmbed).not.toHaveBeenCalled();
  });
});
