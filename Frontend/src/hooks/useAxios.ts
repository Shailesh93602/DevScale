import { createClient } from '@/utils/supabase/client';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useState, useCallback } from 'react';

const httpClient = axios.create({
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
  if (typeof document !== 'undefined') {
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
      typeof globalThis.window !== 'undefined'
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

        if (requiresAuthRoute(window.location.pathname)) {
          window.location.href = '/auth/login';
        } else {
          // If we're on a public route, just reset the lock without redirecting
          isRedirecting = false;
        }
      }
    }
    return Promise.reject(error);
  },
);

// Base API response interface
interface BaseApiResponse<T = unknown> {
  success: boolean;
  message: string;
  error: boolean;
  data: T;
  meta?: {
    pagination?: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      totalPages: number;
    };
    [key: string]: unknown;
  };
}

// Update type definitions
type ApiState<T> = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: AxiosError | null;
  data: T | null;
  meta?: BaseApiResponse<T>['meta'];
} & Pick<BaseApiResponse, 'message' | 'success'>;

type ApiHookReturn<T> = [
  execute: (
    config?: AxiosRequestConfig,
    replacements?: { [key: string]: string },
  ) => Promise<BaseApiResponse<T>>,
  state: ApiState<T>,
];

type ApiPostHookReturn<T, D> = [
  execute: (
    data: D,
    config?: AxiosRequestConfig,
    replacements?: { [key: string]: string },
  ) => Promise<BaseApiResponse<T>>,
  state: ApiState<T>,
];

// Update error handler
const handleError = <T>(error: unknown): BaseApiResponse<T> => {
  const axiosError = error as AxiosError<BaseApiResponse<T>>;
  return {
    success: false,
    error: true,
    data: null as T,
    message: axiosError.response?.data?.message || 'An error occurred',
    meta: axiosError.response?.data?.meta,
  };
};

// Update execute handler
const createExecuteHandler =
  <T, D = unknown>(method: 'get' | 'post' | 'put' | 'patch' | 'delete') =>
  async (url: string, data?: D, config?: AxiosRequestConfig) => {
    try {
      const response = await httpClient[method]<BaseApiResponse<T>>(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error) {
      return handleError<T>(error);
    }
  };

// Updated GET Hook
export const useAxiosGet = <T>(url: string): ApiHookReturn<T> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    message: '',
    success: false,
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    meta: undefined,
  });

  const execute = useCallback(
    async (
      config?: AxiosRequestConfig,
      replacements: { [key: string]: string } = {},
    ) => {
      setState((prev) => ({ ...prev, isLoading: true, isError: false }));

      try {
        let modifiedUrl = url;
        for (const key in replacements) {
          modifiedUrl = modifiedUrl.replace(`{{${key}}}`, replacements[key]);
        }

        const response = await httpClient.get<BaseApiResponse<T>>(
          modifiedUrl,
          config,
        );

        setState({
          data: response.data.data,
          message: response.data.message,
          success: response.data.success,
          meta: response.data.meta,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
        });

        return response.data;
      } catch (error) {
        const errorResponse = handleError<T>(error);
        setState({
          data: null,
          message: errorResponse.message,
          success: false,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error as AxiosError,
          meta: errorResponse.meta,
        });
        return errorResponse;
      }
    },
    [url],
  );

  return [execute, state];
};

// Update other hooks similarly (POST, PUT, PATCH, DELETE)
export const useAxiosPost = <T, D = unknown>(
  url: string,
): ApiPostHookReturn<T, D> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    message: '',
    success: false,
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    meta: undefined,
  });

  const execute = useCallback(
    async (
      data: D,
      config?: AxiosRequestConfig,
      replacements: { [key: string]: string } = {},
    ) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        let modifiedUrl = url;
        for (const key in replacements) {
          modifiedUrl = modifiedUrl.replace(`{{${key}}}`, replacements[key]);
        }

        const response = await httpClient.post<BaseApiResponse<T>>(
          modifiedUrl,
          data,
          config,
        );

        setState({
          data: response.data.data,
          message: response.data.message,
          success: response.data.success,
          meta: response.data.meta,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
        });

        return response.data;
      } catch (error) {
        const errorResponse = handleError<T>(error);
        setState({
          data: null,
          message: errorResponse.message,
          success: false,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error as AxiosError,
          meta: errorResponse.meta,
        });
        return errorResponse;
      }
    },
    [url],
  );

  return [execute, state];
};

// PUT Hook
export const useAxiosPut = <T, D = unknown>(
  url: string,
): ApiPostHookReturn<T, D> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    message: '',
    success: false,
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    meta: undefined,
  });

  const execute = useCallback(
    async (
      data: D,
      config?: AxiosRequestConfig,
      replacements: { [key: string]: string } = {},
    ) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        let modifiedUrl = url;
        for (const key in replacements) {
          modifiedUrl = modifiedUrl.replace(`{{${key}}}`, replacements[key]);
        }
        const result = await createExecuteHandler<T, D>('put')(
          modifiedUrl,
          data,
          config,
        );
        setState({
          data: result.data,
          message: result.message,
          success: result.success,
          meta: result.meta,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
        });
        return result;
      } catch (error) {
        const result = handleError<T>(error);
        setState({
          data: null,
          message: result.message,
          success: false,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error as AxiosError,
          meta: result.meta,
        });
        return result;
      }
    },
    [url],
  );

  return [execute, state];
};

// PATCH Hook
export const useAxiosPatch = <T, D = unknown>(
  url: string,
): ApiPostHookReturn<T, D> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    message: '',
    success: false,
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    meta: undefined,
  });

  const execute = useCallback(
    async (
      data: D,
      config?: AxiosRequestConfig,
      replacements: { [key: string]: string } = {},
    ) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        let modifiedUrl = url;
        for (const key in replacements) {
          modifiedUrl = modifiedUrl.replace(`{{${key}}}`, replacements[key]);
        }
        const result = await createExecuteHandler<T, D>('patch')(
          modifiedUrl,
          data,
          config,
        );
        setState({
          data: result.data,
          message: result.message,
          success: result.success,
          meta: result.meta,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
        });
        return result;
      } catch (error) {
        const result = handleError<T>(error);
        setState({
          data: null,
          message: result.message,
          success: false,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error as AxiosError,
          meta: result.meta,
        });
        return result;
      }
    },
    [url],
  );

  return [execute, state];
};

// DELETE Hook
export const useAxiosDelete = <T = void>(url: string): ApiHookReturn<T> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    message: '',
    success: false,
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    meta: undefined,
  });

  const execute = useCallback(
    async (
      config?: AxiosRequestConfig,
      replacements: { [key: string]: string } = {},
    ) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        let modifiedUrl = url;
        for (const key in replacements) {
          modifiedUrl = modifiedUrl.replace(`{{${key}}}`, replacements[key]);
        }
        const result = await createExecuteHandler<T>('delete')(
          modifiedUrl,
          undefined,
          config,
        );
        setState({
          data: result.data,
          message: result.message,
          success: result.success,
          meta: result.meta,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
        });
        return result;
      } catch (error) {
        const result = handleError<T>(error);
        setState({
          data: null,
          message: result.message,
          success: false,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error as AxiosError,
          meta: result.meta,
        });
        return result;
      }
    },
    [url],
  );

  return [execute, state];
};
