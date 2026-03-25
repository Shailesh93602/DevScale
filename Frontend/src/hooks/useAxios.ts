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

// Base API response interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface BaseApiResponse<T = any> {
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
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
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
