import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import crypto from 'node:crypto';

import {
  encryptSecret,
  decryptSecret,
  maskSecret,
  keyFingerprint,
  isSecretBoxConfigured,
  SecretEncryptionError,
} from '../../utils/secretBox';

const ORIGINAL = process.env.SECRET_ENCRYPTION_KEY;
const KEY_A = crypto.randomBytes(32).toString('base64');
const KEY_B = crypto.randomBytes(32).toString('base64');

beforeEach(() => {
  process.env.SECRET_ENCRYPTION_KEY = KEY_A;
});

afterAll(() => {
  if (ORIGINAL === undefined) delete process.env.SECRET_ENCRYPTION_KEY;
  else process.env.SECRET_ENCRYPTION_KEY = ORIGINAL;
});

describe('secretBox', () => {
  it('round-trips a secret', () => {
    const secret = 'AIzaSy-not-a-real-key-0123456789';
    expect(decryptSecret(encryptSecret(secret))).toBe(secret);
  });

  it('never produces the same ciphertext twice for the same input', () => {
    // The IV is random per call. If this ever fails, GCM's security argument
    // collapses — a reused IV leaks the XOR of plaintexts and can forge the
    // auth key. It is the single most important property in this file.
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) seen.add(encryptSecret('same-input'));
    expect(seen.size).toBe(50);
  });

  it('refuses a tampered ciphertext rather than returning garbage', () => {
    const stored = encryptSecret('secret-value');
    const parts = stored.split('.');
    const data = Buffer.from(parts[3], 'base64url');
    data[0] ^= 0xff;
    parts[3] = data.toString('base64url');

    expect(() => decryptSecret(parts.join('.'))).toThrow(SecretEncryptionError);
  });

  it('refuses a swapped IV', () => {
    const a = encryptSecret('value-a').split('.');
    const b = encryptSecret('value-b').split('.');
    a[1] = b[1];
    expect(() => decryptSecret(a.join('.'))).toThrow(SecretEncryptionError);
  });

  it('refuses a swapped auth tag', () => {
    const a = encryptSecret('value-a').split('.');
    const b = encryptSecret('value-b').split('.');
    a[2] = b[2];
    expect(() => decryptSecret(a.join('.'))).toThrow(SecretEncryptionError);
  });

  it('refuses ciphertext encrypted under a different master key', () => {
    const stored = encryptSecret('value');
    process.env.SECRET_ENCRYPTION_KEY = KEY_B;
    expect(() => decryptSecret(stored)).toThrow(SecretEncryptionError);
  });

  it('refuses a master key that is not exactly 32 bytes', () => {
    // The failure this guards: someone pastes a passphrase, AES-256 silently
    // becomes a short password, and nothing anywhere says so.
    process.env.SECRET_ENCRYPTION_KEY =
      Buffer.from('too-short').toString('base64');
    expect(() => encryptSecret('x')).toThrow(/exactly 32 bytes/);
  });

  it('refuses to run with no master key at all', () => {
    delete process.env.SECRET_ENCRYPTION_KEY;
    expect(isSecretBoxConfigured()).toBe(false);
    expect(() => encryptSecret('x')).toThrow(
      /SECRET_ENCRYPTION_KEY is not set/
    );
  });

  it('refuses to encrypt an empty secret', () => {
    expect(() => encryptSecret('')).toThrow(SecretEncryptionError);
  });

  it('rejects malformed stored values instead of throwing a crypto error', () => {
    expect(() => decryptSecret('not-a-secret')).toThrow(
      /not in the expected format/
    );
    expect(() => decryptSecret('v2.a.b.c')).toThrow(
      /not in the expected format/
    );
    expect(() => decryptSecret('v1.short.short.short')).toThrow(
      /malformed components/
    );
  });

  it('never puts the plaintext in the stored value', () => {
    const secret = 'AIzaSyUNIQUEMARKER0123456789abcd';
    expect(encryptSecret(secret)).not.toContain(secret);
    expect(encryptSecret(secret)).not.toContain('UNIQUEMARKER');
  });

  it('masks to the last four characters only', () => {
    expect(maskSecret('AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe('••••WXYZ');
    expect(maskSecret('abc')).toBe('••••');
  });

  it('fingerprints stably, distinctly, and without revealing the key', () => {
    const key = 'AIzaSy-fingerprint-subject';
    expect(keyFingerprint(key)).toBe(keyFingerprint(key));
    expect(keyFingerprint(key)).not.toBe(keyFingerprint(key + 'x'));
    expect(keyFingerprint(key)).not.toContain('AIza');
    expect(keyFingerprint(key)).toHaveLength(16);
  });

  it('is format-compatible with KhataGO — v1.<iv>.<tag>.<data>', () => {
    // Both projects share one reviewed implementation of the hard part. If the
    // format drifts, that claim quietly stops being true.
    const parts = encryptSecret('x').split('.');
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe('v1');
    expect(Buffer.from(parts[1], 'base64url')).toHaveLength(12);
    expect(Buffer.from(parts[2], 'base64url')).toHaveLength(16);
  });
});
