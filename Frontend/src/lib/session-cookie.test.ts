import { describe, it, expect } from 'vitest';
import {
  hasSupabaseSessionCookie,
  isSupabaseAuthCookieName,
} from './session-cookie';

describe('session cookie detection', () => {
  it('recognises the @supabase/ssr cookie, chunked or not', () => {
    for (const name of [
      'sb-abcdefghijklmnop-auth-token',
      'sb-abcdefghijklmnop-auth-token.0',
      'sb-abcdefghijklmnop-auth-token.12',
      'sb-my-local-ref-auth-token',
    ]) {
      expect(isSupabaseAuthCookieName(name), name).toBe(true);
    }
  });

  it('ignores everything else, including look-alikes', () => {
    for (const name of [
      'XSRF-TOKEN',
      'theme',
      'sb-abcdefghijklmnop-auth-token-verifier',
      'sb-abcdefghijklmnop-code-verifier',
      'auth-token',
      'sb-auth-token',
    ]) {
      expect(isSupabaseAuthCookieName(name), name).toBe(false);
    }
  });

  it('answers over a whole cookie jar and is false for an empty one', () => {
    expect(hasSupabaseSessionCookie([])).toBe(false);
    expect(hasSupabaseSessionCookie([{ name: 'theme' }])).toBe(false);
    expect(
      hasSupabaseSessionCookie([
        { name: 'theme' },
        { name: 'sb-ref-auth-token.1' },
      ]),
    ).toBe(true);
  });
});
