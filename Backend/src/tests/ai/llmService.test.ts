import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { z } from 'zod';

/**
 * Spine A orchestration tests — no network, no DB. The raw Gemini call
 * (llmConfig.rawGenerate) and the Redis cache are mocked so we assert the real
 * logic: cache reuse, JSON parse, corrective retry, schema validation, and
 * multi-model fallback.
 */

const mockRawGenerate =
  jest.fn<(model: string, prompt: string) => Promise<string>>();
let hasKey = true;

jest.mock('../../services/ai/llmConfig', () => ({
  __esModule: true,
  MODEL_CHAIN: ['model-a', 'model-b'],
  isAiConfigured: () => true,
  rawGenerate: (model: string, prompt: string) =>
    mockRawGenerate(model, prompt),
}));

// Whose quota a call spends is resolveApiKey's job and is tested there. Here it
// only has to answer "is there a key", which is what generateStructured gates on.
jest.mock('../../services/ai/resolveApiKey', () => ({
  __esModule: true,
  requireApiKey: async () => {
    if (!hasKey) {
      throw Object.assign(new Error('AI key required'), { statusCode: 400 });
    }
    return { apiKey: 'test-key', fingerprint: 'test-fp', kind: 'user' };
  },
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

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import {
  generateStructured,
  _resetLlmState,
} from '../../services/ai/llmService';

const Schema = z.object({ answer: z.string(), n: z.number() });

beforeEach(() => {
  store.clear();
  mockRawGenerate.mockReset();
  hasKey = true;
  _resetLlmState();
});

describe('generateStructured (Spine A)', () => {
  it('parses and returns a schema-valid object on the happy path', async () => {
    mockRawGenerate.mockResolvedValue('{"answer":"hi","n":1}');
    const result = await generateStructured({
      cacheKey: 'k1',
      prompt: 'p',
      schema: Schema,
    });
    expect(result).toEqual({ answer: 'hi', n: 1 });
    expect(mockRawGenerate).toHaveBeenCalledTimes(1);
  });

  it('retries once with a corrective prompt when the first reply is malformed', async () => {
    mockRawGenerate
      .mockResolvedValueOnce('not json at all')
      .mockResolvedValueOnce('{"answer":"ok","n":2}');
    const result = await generateStructured({
      cacheKey: 'k2',
      prompt: 'p',
      schema: Schema,
    });
    expect(result).toEqual({ answer: 'ok', n: 2 });
    expect(mockRawGenerate).toHaveBeenCalledTimes(2);
  });

  it('strips ```json code fences before parsing', async () => {
    mockRawGenerate.mockResolvedValue(
      '```json\n{"answer":"fenced","n":3}\n```'
    );
    const result = await generateStructured({
      cacheKey: 'k3',
      prompt: 'p',
      schema: Schema,
    });
    expect(result).toEqual({ answer: 'fenced', n: 3 });
  });

  it('throws when output never matches the schema, even after retry', async () => {
    mockRawGenerate.mockResolvedValue('{"answer":"x"}'); // missing n
    await expect(
      generateStructured({ cacheKey: 'k4', prompt: 'p', schema: Schema })
    ).rejects.toThrow();
    expect(mockRawGenerate).toHaveBeenCalledTimes(2);
  });

  it('returns the cached value without calling the provider', async () => {
    store.set('llm:k5', { answer: 'cached', n: 9 });
    const result = await generateStructured({
      cacheKey: 'k5',
      prompt: 'p',
      schema: Schema,
    });
    expect(result).toEqual({ answer: 'cached', n: 9 });
    expect(mockRawGenerate).not.toHaveBeenCalled();
  });

  it('falls back to the next model when the first is rate-limited', async () => {
    mockRawGenerate.mockImplementation(async (model: string) => {
      if (model === 'model-a') {
        throw new Error('429 RESOURCE_EXHAUSTED rate limit');
      }
      return '{"answer":"from-b","n":4}';
    });
    const result = await generateStructured({
      cacheKey: 'k6',
      prompt: 'p',
      schema: Schema,
    });
    expect(result).toEqual({ answer: 'from-b', n: 4 });
    expect(mockRawGenerate).toHaveBeenCalledWith('model-a', expect.any(String));
    expect(mockRawGenerate).toHaveBeenCalledWith('model-b', expect.any(String));
  });

  it('throws before any provider call when there is no key', async () => {
    // 400, not 503: the request is fine, the CALLER has not supplied something
    // only they can supply. 503 would blame the service and invite a retry
    // that cannot succeed.
    hasKey = false;
    await expect(
      generateStructured({ cacheKey: 'k7', prompt: 'p', schema: Schema })
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(mockRawGenerate).not.toHaveBeenCalled();
  });

  it('checks for a key BEFORE reading the cache', async () => {
    // Otherwise a user with no key is quietly served someone else's cache hit
    // and the feature appears to work until the first miss — the worst
    // possible moment to discover you needed a key.
    mockRawGenerate.mockResolvedValue('{"answer":"warm","n":1}');
    await generateStructured({ cacheKey: 'k9', prompt: 'p', schema: Schema });

    hasKey = false;
    await expect(
      generateStructured({ cacheKey: 'k9', prompt: 'p', schema: Schema })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('writes the result to cache so a second call is a hit', async () => {
    mockRawGenerate.mockResolvedValue('{"answer":"once","n":5}');
    await generateStructured({ cacheKey: 'k8', prompt: 'p', schema: Schema });
    const second = await generateStructured({
      cacheKey: 'k8',
      prompt: 'p',
      schema: Schema,
    });
    expect(second).toEqual({ answer: 'once', n: 5 });
    expect(mockRawGenerate).toHaveBeenCalledTimes(1); // second call served from cache
  });
});
