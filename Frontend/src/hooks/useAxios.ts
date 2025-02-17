import { createClient } from '@/utils/supabase/client';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useState, useCallback } from 'react';

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Add Supabase auth interceptor
httpClient.interceptors.request.use(async (config) => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

type ApiState<T> = {
  data: T | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: AxiosError | null;
};

type ApiHookReturn<T> = ApiState<T> & {
  execute: (config?: AxiosRequestConfig) => Promise<void>;
};

type ApiPostHookReturn<T, D> = ApiState<T> & {
  execute: (data: D, config?: AxiosRequestConfig) => Promise<void>;
  post: (data: D, config?: AxiosRequestConfig) => Promise<void>;
};

type ApiPutHookReturn<T, D> = ApiState<T> & {
  put: (data: D, config?: AxiosRequestConfig) => Promise<void>;
};

type ApiPatchHookReturn<T, D> = ApiState<T> & {
  patch: (data: D, config?: AxiosRequestConfig) => Promise<void>;
};

type ApiDeleteHookReturn<T> = ApiState<T> & {
  delete: (config?: AxiosRequestConfig) => Promise<void>;
};

export const useAxiosGet = <T>(url: string): ApiHookReturn<T> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  const execute = useCallback(
    async (config?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, isError: false }));

      try {
        const response = await httpClient.get<T>(url, config);
        setState({
          data: response.data,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error as AxiosError,
        });
      }
    },
    [url],
  );

  return { ...state, execute };
};

export const useAxiosPost = <T, D = unknown>(
  url: string,
): ApiPostHookReturn<T, D> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  const post = useCallback(
    async (data: D, config?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, isError: false }));

      try {
        const response = await httpClient.post<T>(url, data, config);
        setState({
          data: response.data,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error as AxiosError,
        });
      }
    },
    [url],
  );

  return {
    ...state,
    execute: post,
    post,
  };
};

// PUT Hook
export const useAxiosPut = <T, D = unknown>(
  url: string,
): ApiPutHookReturn<T, D> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  const put = useCallback(
    async (data: D, config?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, isError: false }));

      try {
        const response = await httpClient.put<T>(url, data, config);
        setState({
          data: response.data,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error as AxiosError,
        });
      }
    },
    [url],
  );

  return { ...state, put };
};

// PATCH Hook
export const useAxiosPatch = <T, D = unknown>(
  url: string,
): ApiPatchHookReturn<T, D> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  const patch = useCallback(
    async (data: D, config?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, isError: false }));

      try {
        const response = await httpClient.patch<T>(url, data, config);
        setState({
          data: response.data,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error as AxiosError,
        });
      }
    },
    [url],
  );

  return { ...state, patch };
};

// DELETE Hook
export const useAxiosDelete = <T = void>(
  url: string,
): ApiDeleteHookReturn<T> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  const deleteFn = useCallback(
    async (config?: AxiosRequestConfig) => {
      setState((prev) => ({ ...prev, isLoading: true, isError: false }));

      try {
        const response = await httpClient.delete<T>(url, config);
        setState({
          data: response.data,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error as AxiosError,
        });
      }
    },
    [url],
  );

  return { ...state, delete: deleteFn };
};
