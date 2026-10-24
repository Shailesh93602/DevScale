import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AxiosAdapter } from 'axios';

type Session = { access_token: string; expires_at?: number } | null;
const h = vi.hoisted(() => ({
  session: null as Session,
  getSession: vi.fn(),
  authListeners: [] as Array<(event: string) => void>,
}));
vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: h.getSession,
      onAuthStateChange: (fn: (event: string) => void) => {
        h.authListeners.push(fn);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signOut: vi.fn(),
    },
  }),
}));

import { httpClient } from './httpClient';

const T0 = new Date('2026-10-16T10:00:00Z').getTime();
const sentAuth = async () => {
  let auth: unknown;
  const adapter: AxiosAdapter = async (config) => {
    auth = config.headers.Authorization;
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
  };
  await httpClient.get('/ping', { adapter });
  return auth;
};

describe('httpClient access-token cache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
    h.getSession.mockReset().mockImplementation(async () => ({
      data: { session: h.session },
    }));
    // Expire any token cached by a previous test.
    for (const fn of h.authListeners) fn('SIGNED_OUT');
  });
  afterEach(() => vi.useRealTimers());

  it("is not reused past the token's own expiry", async () => {
    // Read from storage with 5 minutes left — not a fresh hour.
    h.session = { access_token: 'old', expires_at: T0 / 1000 + 300 };
    expect(await sentAuth()).toBe('Bearer old');

    h.session = { access_token: 'refreshed', expires_at: T0 / 1000 + 3900 };
    vi.setSystemTime(T0 + 10 * 60 * 1000); // 'old' expired 5 min ago
    expect(await sentAuth()).toBe('Bearer refreshed');
  });

  it('a sign-out stops the cached token from being sent', async () => {
    h.session = { access_token: 'mine', expires_at: T0 / 1000 + 3600 };
    expect(await sentAuth()).toBe('Bearer mine');

    h.session = null;
    for (const fn of h.authListeners) fn('SIGNED_OUT');
    expect(await sentAuth()).toBeUndefined();
  });

  it('still caches within the validity window', async () => {
    h.session = { access_token: 'mine', expires_at: T0 / 1000 + 3600 };
    await sentAuth();
    await sentAuth();
    expect(h.getSession).toHaveBeenCalledTimes(1);
  });
});

describe('httpClient realtime-host routing', () => {
  const sentTo = async (method: 'get' | 'post', url: string) => {
    let seen: { baseURL?: string; timeout?: number } = {};
    const adapter: AxiosAdapter = async (config) => {
      seen = { baseURL: config.baseURL, timeout: config.timeout };
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };
    await httpClient.request({ method, url, adapter });
    return seen;
  };
  beforeEach(() => {
    h.getSession.mockReset().mockResolvedValue({ data: { session: null } });
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('{}'))),
    );
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sends battle writes to the realtime host with a cold-start timeout', async () => {
    vi.stubEnv(
      'NEXT_PUBLIC_REALTIME_API_BASE_URL',
      'https://rt.example.test/api/v1',
    );
    const seen = await sentTo('post', '/battles/abc/start');
    expect(seen.baseURL).toBe('https://rt.example.test/api/v1');
    expect(seen.timeout).toBe(75_000);
  });

  it('leaves battle reads and other routes on the default host', async () => {
    vi.stubEnv(
      'NEXT_PUBLIC_REALTIME_API_BASE_URL',
      'https://rt.example.test/api/v1',
    );
    expect((await sentTo('get', '/battles/abc')).baseURL).toBe(
      httpClient.defaults.baseURL,
    );
    expect((await sentTo('post', '/roadmaps/enroll')).baseURL).toBe(
      httpClient.defaults.baseURL,
    );
  });

  it('changes nothing when the realtime host is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_REALTIME_API_BASE_URL', '');
    const seen = await sentTo('post', '/battles/abc/start');
    expect(seen.baseURL).toBe(httpClient.defaults.baseURL);
    expect(seen.timeout).toBe(20_000);
  });
});
