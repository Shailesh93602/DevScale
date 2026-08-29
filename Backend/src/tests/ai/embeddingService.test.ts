import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// embedText resolves a key before embedding; whose key it is belongs to
// resolveApiKey's own tests. Here it only has to say "there is one".
let hasKey = true;
jest.mock('../../services/ai/resolveApiKey', () => ({
  __esModule: true,
  requireApiKey: async () => {
    if (!hasKey) {
      throw Object.assign(new Error('AI key required'), { statusCode: 400 });
    }
    return { apiKey: 'test-key', fingerprint: 'test-fp', kind: 'user' };
  },
}));

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
  setCache: async (key: string, value: unknown, opts?: { prefix?: string }) => {
    store.set(opts?.prefix ? `${opts.prefix}:${key}` : key, value);
  },
}));

import { embedText, hashText } from '../../services/ai/embeddingService';

beforeEach(() => {
  store.clear();
  mockRawEmbed.mockReset();
  hasKey = true;
});

describe('embedText', () => {
  it('embeds text and caches the vector', async () => {
    mockRawEmbed.mockResolvedValue([0.1, 0.2, 0.3]);
    const vector = await embedText('hello world');
    expect(vector).toEqual([0.1, 0.2, 0.3]);
    expect(mockRawEmbed).toHaveBeenCalledTimes(1);
  });

  it('returns the cached vector without calling the provider', async () => {
    store.set(`embedding:${hashText('cached text')}`, [9, 9]);
    const vector = await embedText('cached text');
    expect(vector).toEqual([9, 9]);
    expect(mockRawEmbed).not.toHaveBeenCalled();
  });

  it('only embeds once for repeated identical text (cache write-through)', async () => {
    mockRawEmbed.mockResolvedValue([1]);
    await embedText('same');
    await embedText('same');
    expect(mockRawEmbed).toHaveBeenCalledTimes(1);
  });

  it('throws before any provider call when there is no key', async () => {
    hasKey = false;
    await expect(embedText('anything')).rejects.toThrow();
    expect(mockRawEmbed).not.toHaveBeenCalled();
  });
});

describe('hashText', () => {
  it('is deterministic and content-sensitive', () => {
    expect(hashText('a')).toBe(hashText('a'));
    expect(hashText('a')).not.toBe(hashText('b'));
  });
});
