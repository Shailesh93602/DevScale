import { createClient } from '@/utils/supabase/client';
import axios, { AxiosError } from 'axios';

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

// In-memory token cache: avoids calling getSession() on every request.
// Supabase tokens are valid for 1 hour; we keep a 55-minute window to allow
// early refresh before expiry. On 401 the cache is cleared and the real
// session is fetched fresh.
let _cachedToken: string | null = null;
let _tokenExpiresAt: number = 0;

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (_cachedToken && now < _tokenExpiresAt) return _cachedToken;

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  if (!session?.access_token) {
    _cachedToken = null;
    _tokenExpiresAt = 0;
    return null;
  }

  _cachedToken = session.access_token;
  // Cache for 55 minutes (tokens expire after 1 hour)
  _tokenExpiresAt = now + 55 * 60 * 1000;
  return _cachedToken;
}

// Add Supabase auth and CSRF interceptors
httpClient.interceptors.request.use(async (config) => {
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
      _cachedToken = null;
      _tokenExpiresAt = 0;

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
