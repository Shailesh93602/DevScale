import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * The claim bring-your-own-keys makes is ISOLATION: what one user's key does
 * must not affect anyone else. That claim is not free — it is delivered by two
 * specific decisions (cooldowns scoped per key, one breaker per key), and both
 * are the kind of thing a later refactor "simplifies" back into a shared map
 * without anything failing.
 *
 * These tests fail if that happens. They are written against the observable
 * behaviour (does user B's call still reach the provider?) rather than against
 * the internal Maps, so they survive a reimplementation.
 */

const mockRawGenerate =
  jest.fn<
    (
      model: string,
      prompt: string,
      apiKey: string,
      fingerprint: string
    ) => Promise<string>
  >();

jest.mock('../../services/ai/llmConfig', () => ({
  __esModule: true,
  MODEL_CHAIN: ['model-a', 'model-b'],
  isAiConfigured: () => true,
  rawGenerate: (
    model: string,
    prompt: string,
    apiKey: string,
    fingerprint: string
  ) => mockRawGenerate(model, prompt, apiKey, fingerprint),
}));

// Each user's key resolves to itself, so the fingerprint differs per user.
jest.mock('../../services/ai/resolveApiKey', () => ({
  __esModule: true,
  requireApiKey: async (userId?: string | null) => ({
    apiKey: `key-for-${userId ?? 'server'}`,
    fingerprint: `fp-${userId ?? 'server'}`,
    kind: userId ? 'user' : 'server',
  }),
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

import { z } from 'zod';
import {
  generateStructured,
  _resetLlmState,
} from '../../services/ai/llmService';

const Schema = z.object({ ok: z.boolean() });
const OK = '{"ok":true}';

function rateLimited(): Error {
  return Object.assign(new Error('429 RESOURCE_EXHAUSTED'), { status: 429 });
}

beforeEach(() => {
  store.clear();
  mockRawGenerate.mockReset();
  _resetLlmState();
});

describe('per-key isolation', () => {
  it("bills the call to the caller's own key", async () => {
    mockRawGenerate.mockResolvedValue(OK);

    await generateStructured({
      cacheKey: 'a',
      prompt: 'p',
      schema: Schema,
      userId: 'alice',
    });

    expect(mockRawGenerate).toHaveBeenCalledWith(
      'model-a',
      'p',
      'key-for-alice',
      'fp-alice'
    );
  });

  it("one user's rate limit does not cool the model down for anyone else", async () => {
    // Alice exhausts model-a. Before scoping, this parked model-a globally for
    // 60 seconds — Bob, on a completely separate quota, would silently be
    // downgraded to model-b, and so would the server key.
    mockRawGenerate.mockImplementation(async (model) => {
      if (model === 'model-a') throw rateLimited();
      return OK;
    });
    await generateStructured({
      cacheKey: 'a',
      prompt: 'pa',
      schema: Schema,
      userId: 'alice',
    });

    mockRawGenerate.mockReset();
    mockRawGenerate.mockResolvedValue(OK);

    await generateStructured({
      cacheKey: 'b',
      prompt: 'pb',
      schema: Schema,
      userId: 'bob',
    });

    // Bob still gets the FIRST model in the chain — the best one.
    expect(mockRawGenerate).toHaveBeenCalledWith(
      'model-a',
      'pb',
      'key-for-bob',
      'fp-bob'
    );
  });

  it('still honours a cooldown for the user who actually hit it', async () => {
    // The mirror image. Scoping must not amount to "never cool anything down".
    mockRawGenerate.mockImplementation(async (model) => {
      if (model === 'model-a') throw rateLimited();
      return OK;
    });
    await generateStructured({
      cacheKey: 'a1',
      prompt: 'p1',
      schema: Schema,
      userId: 'alice',
    });

    mockRawGenerate.mockReset();
    mockRawGenerate.mockResolvedValue(OK);

    await generateStructured({
      cacheKey: 'a2',
      prompt: 'p2',
      schema: Schema,
      userId: 'alice',
    });

    const modelsTried = mockRawGenerate.mock.calls.map((c) => c[0]);
    expect(modelsTried).not.toContain('model-a');
    expect(modelsTried).toContain('model-b');
  });

  it("one user's bad key does not open the circuit breaker for everyone", async () => {
    // A typo'd credential fails on EVERY call. A single shared breaker trips at
    // 5 failures / 50% and then fails fast for every caller — one user's typo
    // would disable the AI features platform-wide within seconds.
    mockRawGenerate.mockImplementation(async (_m, _p, apiKey) => {
      if (apiKey === 'key-for-mallory') {
        throw Object.assign(new Error('API key not valid'), { status: 400 });
      }
      return OK;
    });

    for (let i = 0; i < 12; i++) {
      await generateStructured({
        cacheKey: `m${i}`,
        prompt: `pm${i}`,
        schema: Schema,
        userId: 'mallory',
      }).catch(() => undefined);
    }

    await expect(
      generateStructured({
        cacheKey: 'bob',
        prompt: 'pbob',
        schema: Schema,
        userId: 'bob',
      })
    ).resolves.toEqual({ ok: true });
  });

  it('shares the cache across users — an identical prompt is not paid for twice', async () => {
    // The deliberate exception to isolation. The value contains no key
    // material and an identical prompt has an identical answer, so
    // partitioning would make every user re-buy work already done.
    mockRawGenerate.mockResolvedValue(OK);

    await generateStructured({
      cacheKey: 'shared',
      prompt: 'p',
      schema: Schema,
      userId: 'alice',
    });
    await generateStructured({
      cacheKey: 'shared',
      prompt: 'p',
      schema: Schema,
      userId: 'bob',
    });

    expect(mockRawGenerate).toHaveBeenCalledTimes(1);
  });
});
