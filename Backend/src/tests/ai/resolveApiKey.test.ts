import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterAll,
} from '@jest/globals';
import crypto from 'node:crypto';

/**
 * Who pays for an AI call. No network, no DB — Prisma and the env are mocked so
 * the precedence rules and the failure modes are asserted directly.
 */

const MASTER = crypto.randomBytes(32).toString('base64');
const ORIGINAL_MASTER = process.env.SECRET_ENCRYPTION_KEY;
process.env.SECRET_ENCRYPTION_KEY = MASTER;

let serverKey = '';
jest.mock('../../config/env', () => ({
  __esModule: true,
  get env() {
    return { GEMINI_API_KEY: serverKey };
  },
}));

const findUnique = jest.fn<() => Promise<{ key_enc: string } | null>>();
const update = jest.fn<() => Promise<unknown>>();
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    userAiKey: { findUnique: () => findUnique(), update: () => update() },
  },
}));

const logError = jest.fn();
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: logError,
    debug: jest.fn(),
  },
}));

import {
  resolveApiKey,
  requireApiKey,
  NoApiKeyError,
} from '../../services/ai/resolveApiKey';
import { encryptSecret, keyFingerprint } from '../../utils/secretBox';

const USER_KEY = 'AIzaSy-the-users-own-key-000000';

beforeEach(() => {
  findUnique.mockReset();
  update.mockReset().mockResolvedValue(undefined);
  logError.mockReset();
  serverKey = '';
});

afterAll(() => {
  if (ORIGINAL_MASTER === undefined) delete process.env.SECRET_ENCRYPTION_KEY;
  else process.env.SECRET_ENCRYPTION_KEY = ORIGINAL_MASTER;
});

describe('resolveApiKey', () => {
  it("prefers the user's own key over the server key", async () => {
    serverKey = 'server-key';
    findUnique.mockResolvedValue({ key_enc: encryptSecret(USER_KEY) });

    const resolved = await resolveApiKey('user-1');

    expect(resolved.kind).toBe('user');
    expect(resolved.apiKey).toBe(USER_KEY);
    expect(resolved.fingerprint).toBe(keyFingerprint(USER_KEY));
  });

  it('falls back to the server key when the user has none', async () => {
    serverKey = 'server-key';
    findUnique.mockResolvedValue(null);

    const resolved = await resolveApiKey('user-1');

    expect(resolved.kind).toBe('server');
    expect(resolved.apiKey).toBe('server-key');
    // 'server', not a hash — every server-key request shares one breaker and
    // one set of cooldowns, which is correct because it IS one key.
    expect(resolved.fingerprint).toBe('server');
  });

  it('resolves to nothing when neither exists', async () => {
    findUnique.mockResolvedValue(null);
    expect((await resolveApiKey('user-1')).kind).toBe('none');
  });

  it('does not query for a user key when no user is given', async () => {
    // Background jobs act on nobody's behalf; there is no key to look up.
    serverKey = 'server-key';
    const resolved = await resolveApiKey(undefined);
    expect(resolved.kind).toBe('server');
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('does NOT fall back to the server key when the stored key will not decrypt', async () => {
    // The load-bearing test. Falling through would hand the user a working
    // feature that is not using the key they configured, bill the owner for
    // it, and hide a rotated master key or tampering forever.
    serverKey = 'server-key';
    findUnique.mockResolvedValue({ key_enc: 'v1.corrupt.corrupt.corrupt' });

    const resolved = await resolveApiKey('user-1');

    expect(resolved.kind).toBe('none');
    expect(logError).toHaveBeenCalled();
  });

  it('never logs the key or the ciphertext when decryption fails', async () => {
    findUnique.mockResolvedValue({ key_enc: 'v1.corrupt.corrupt.corrupt' });
    await resolveApiKey('user-1');

    const logged = logError.mock.calls.flat().join(' ');
    expect(logged).toContain('user-1');
    expect(logged).not.toContain('corrupt');
    expect(logged).not.toContain(USER_KEY);
  });

  it('a failed last_used stamp does not fail the request', async () => {
    findUnique.mockResolvedValue({ key_enc: encryptSecret(USER_KEY) });
    update.mockRejectedValue(new Error('db down'));

    await expect(resolveApiKey('user-1')).resolves.toMatchObject({
      kind: 'user',
    });
  });
});

describe('requireApiKey', () => {
  it('throws an actionable 400 when there is no key', async () => {
    findUnique.mockResolvedValue(null);

    await expect(requireApiKey('user-1')).rejects.toThrow(NoApiKeyError);
    await expect(requireApiKey('user-1')).rejects.toMatchObject({
      // `statusCode`, not `status` — the error handler branches on that name
      // and anything else becomes a 500 whose message is replaced in prod.
      statusCode: 400,
      details: { code: 'AI_KEY_REQUIRED' },
    });
  });

  it('tells the user what to do, not what went wrong', async () => {
    findUnique.mockResolvedValue(null);
    const err = await requireApiKey('user-1').then(
      () => null,
      (e: Error) => e
    );

    expect(err).not.toBeNull();
    expect(err!.message).toMatch(/Settings/);
    expect(err!.message).not.toMatch(/GEMINI_API_KEY|env|null|undefined|50\d/);
  });
});
