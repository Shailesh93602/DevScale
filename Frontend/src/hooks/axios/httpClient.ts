import { createClient } from '@/utils/supabase/client';
import axios, { AxiosError } from 'axios';
import {
  REALTIME_TIMEOUT_MS,
  isBattlePath,
  needsRealtimeHost,
  realtimeApiBase,
  warmRealtimeHost,
} from '@/lib/realtime-host';

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 20000,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Singleton Supabase client — created once, reused for all requests.
const supabaseClient = createClient();

// In-memory token cache: avoids calling getSession() on every request. It
// lives until a minute before the token's OWN expiry (a session read from
// storage can already be most of an hour old), and any auth change clears it,
// so a sign-out or a background refresh is never answered with a stale token.
let _cachedToken: string | null = null;
let _tokenExpiresAt: number = 0;

function clearCachedToken() {
  _cachedToken = null;
  _tokenExpiresAt = 0;
}

if (globalThis.window !== undefined) {
  supabaseClient.auth.onAuthStateChange(() => clearCachedToken());
}

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (_cachedToken && now < _tokenExpiresAt) return _cachedToken;

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  if (!session?.access_token) {
    clearCachedToken();
    return null;
  }

  _cachedToken = session.access_token;
  // No expires_at → expiry unknown → do not cache.
  _tokenExpiresAt = session.expires_at ? session.expires_at * 1000 - 60_000 : 0;
  return _cachedToken;
}

// Add Supabase auth and CSRF interceptors
httpClient.interceptors.request.use(async (config) => {
  const realtimeBase = realtimeApiBase();
  if (realtimeBase && isBattlePath(config.url)) {
    warmRealtimeHost();
    if (needsRealtimeHost(config.method, config.url)) {
      config.baseURL = realtimeBase;
      config.timeout = Math.max(config.timeout ?? 0, REALTIME_TIMEOUT_MS);
    }
  }

  // 1. Auth Token
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2. CSRF Token (Double-Submit Token Pattern)
  if (globalThis.document !== undefined) {
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.trim().startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
  }

  return config;
});

let isRedirecting = false;

// Add response interceptor to handle 401 Unauthorized
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Only act on 401 Unauthorized if not already redirecting and in the browser
    if (
      error.response?.status === 401 &&
      !isRedirecting &&
      globalThis.window !== undefined
    ) {
      // Clear cached token — it may be expired or revoked
      clearCachedToken();

      isRedirecting = true;
      try {
        await supabaseClient.auth.signOut();
        const { logoutAction } = await import('@/app/auth/actions');
        await logoutAction();
      } catch (e) {
        console.error('Logout sync failed:', e);
      } finally {
        document.cookie = 'token=; Max-Age=0; path=/;';

        // Dynamically import router helpers to check if path requires auth
        const { requiresAuthRoute } = await import('@/lib/public-routes');

        if (requiresAuthRoute(globalThis.window?.location.pathname || '')) {
          globalThis.window.location.href = '/auth/login';
        } else {
          // If we're on a public route, just reset the lock without redirecting
          isRedirecting = false;
        }
      }
    }
    throw error;
  },
);
