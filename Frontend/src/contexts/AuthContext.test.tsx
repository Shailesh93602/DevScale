import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';

type Listener = (event: string, session: unknown) => Promise<void> | void;

const h = vi.hoisted(() => ({
  listener: null as Listener | null,
  session: null as null | {
    access_token: string;
    user: { id: string; email: string; user_metadata: object };
  },
}));

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: (cb: Listener) => {
        h.listener = cb;
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      getSession: async () => ({ data: { session: h.session } }),
      getUser: async () => ({ data: { user: h.session?.user ?? null } }),
      signOut: async () => {},
    },
  }),
}));
vi.mock('@/lib/dashboard-cache', () => ({ clearDashboardCache: () => {} }));

import { AuthProvider, PROFILE_RETRY_DELAYS_MS, useAuth } from './AuthContext';

const SUPABASE_ID = 'supabase-uuid';
const PROFILE = { id: 'user-row-id', username: 'alpha', role: null };

const fetchMock = vi.fn();
const ok = () =>
  ({ ok: true, json: async () => ({ data: PROFILE }) }) as Response;
const fail = () => ({ ok: false, json: async () => ({}) }) as Response;

function Probe() {
  const { userId, user, profileStatus, status } = useAuth();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="profile">{profileStatus}</span>
      <span data-testid="userId">{userId ?? 'null'}</span>
      <span data-testid="userRecordId">{user?.id ?? 'none'}</span>
    </div>
  );
}

const text = (id: string) => screen.getByTestId(id).textContent;

/** Let pending promises (fetch, getSession) settle under fake timers. */
async function flush() {
  for (let i = 0; i < 5; i++) await act(async () => {});
}

async function signIn(event = 'INITIAL_SESSION') {
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  await act(async () => {
    await h.listener!(event, h.session);
  });
  await flush();
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
  await flush();
}

beforeEach(() => {
  vi.useFakeTimers();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  h.listener = null;
  h.session = {
    access_token: 'token',
    user: { id: SUPABASE_ID, email: 'alpha@example.test', user_metadata: {} },
  };
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('AuthContext profile loading', () => {
  it('a failed first /users/me is retried, and userId is null until it loads', async () => {
    fetchMock.mockResolvedValueOnce(fail()).mockResolvedValue(ok());
    await signIn();

    expect(text('status')).toBe('authenticated');
    expect(text('profile')).toBe('fallback');
    expect(text('userId')).toBe('null');
    // The fallback never carries the Supabase id where a User.id is expected.
    expect(text('userRecordId')).not.toBe(SUPABASE_ID);

    await advance(PROFILE_RETRY_DELAYS_MS[0]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(text('profile')).toBe('ready');
    expect(text('userId')).toBe(PROFILE.id);
  });

  it('backs off on the schedule and stops after the last delay', async () => {
    fetchMock.mockResolvedValue(fail());
    await signIn();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    for (const [i, delay] of PROFILE_RETRY_DELAYS_MS.entries()) {
      await advance(delay - 1);
      expect(fetchMock).toHaveBeenCalledTimes(i + 1);
      await advance(1);
      expect(fetchMock).toHaveBeenCalledTimes(i + 2);
    }
    await advance(10 * 60_000);
    expect(fetchMock).toHaveBeenCalledTimes(PROFILE_RETRY_DELAYS_MS.length + 1);
    expect(text('userId')).toBe('null');
  });

  it('refetches on window focus and on reconnect while on the fallback', async () => {
    fetchMock.mockResolvedValue(fail());
    await signIn();
    await advance(PROFILE_RETRY_DELAYS_MS.reduce((a, b) => a + b, 0));
    const before = fetchMock.mock.calls.length;

    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(before + 1);

    fetchMock.mockResolvedValue(ok());
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(before + 2);
    expect(text('userId')).toBe(PROFILE.id);

    // Once loaded, focus does not refetch.
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(before + 2);
  });

  it('shows a quiet notice after repeated failures, with a working Retry', async () => {
    fetchMock.mockResolvedValue(fail());
    await signIn();
    expect(screen.queryByRole('status')).toBeNull();

    await advance(PROFILE_RETRY_DELAYS_MS[0]);
    expect(screen.getByRole('status')).toHaveTextContent(
      /couldn.t load your profile/i,
    );

    fetchMock.mockResolvedValue(ok());
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    await flush();
    expect(text('userId')).toBe(PROFILE.id);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('a failed token refresh keeps the profile already loaded', async () => {
    fetchMock.mockResolvedValueOnce(ok()).mockResolvedValue(fail());
    await signIn();
    expect(text('userId')).toBe(PROFILE.id);

    await act(async () => {
      await h.listener!('TOKEN_REFRESHED', h.session);
    });
    await flush();
    expect(text('profile')).toBe('ready');
    expect(text('userId')).toBe(PROFILE.id);
    await advance(60_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('signing out cancels a pending retry', async () => {
    fetchMock.mockResolvedValue(fail());
    await signIn();
    await act(async () => {
      await h.listener!('SIGNED_OUT', null);
    });
    await advance(60_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(text('status')).toBe('unauthenticated');
    expect(text('userId')).toBe('null');
  });
});
