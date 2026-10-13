import { AxiosRequestConfig, AxiosError } from 'axios';
import { useState, useCallback } from 'react';
import { httpClient } from './axios/httpClient';
import type {
  ApiHookReturn,
  ApiPostHookReturn,
  ApiState,
  BaseApiResponse,
} from './axios/apiTypes';

type Replacements = { [key: string]: string };

const handleError = <T>(error: unknown): BaseApiResponse<T> => {
  const axiosError = error as AxiosError<BaseApiResponse<T>>;
  return {
    success: false,
    error: true,
    data: null as T,
    message: axiosError.response?.data?.message || 'An error occurred',
    meta: axiosError.response?.data?.meta,
    // Preserved deliberately: dropping it made the API's machine-readable code invisible.
    details: axiosError.response?.data?.details,
  };
};

/** Never throws: an HTTP error comes back as a `handleError` response. */
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

/** Fills `{{key}}` placeholders in a URL template. */
function fillUrl(url: string, replacements: Replacements): string {
  let modifiedUrl = url;
  for (const key in replacements) {
    modifiedUrl = modifiedUrl.replace(`{{${key}}}`, replacements[key]);
  }
  return modifiedUrl;
}

const INITIAL_STATE: ApiState<never> = {
  data: null,
  message: '',
  success: false,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  meta: undefined,
};

/** Shared state machine for every verb: loading, then the response, or a handled error on throw. */
function useApiCall<T>(resetErrorOnStart: boolean) {
  const [state, setState] = useState<ApiState<T>>(INITIAL_STATE);

  const run = useCallback(
    async (send: () => Promise<BaseApiResponse<T>>) => {
      setState((prev) =>
        resetErrorOnStart
          ? { ...prev, isLoading: true, isError: false }
          : { ...prev, isLoading: true },
      );

      try {
        const result = await send();
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
    [resetErrorOnStart],
  );

  return [run, state] as const;
}

export const useAxiosGet = <T>(url: string): ApiHookReturn<T> => {
  const [run, state] = useApiCall<T>(true);

  const execute = useCallback(
    (config?: AxiosRequestConfig, replacements: Replacements = {}) =>
      run(async () => {
        const response = await httpClient.get<BaseApiResponse<T>>(
          fillUrl(url, replacements),
          config,
        );
        return response.data;
      }),
    [url, run],
  );

  return [execute, state];
};

export const useAxiosPost = <T, D = unknown>(
  url: string,
): ApiPostHookReturn<T, D> => {
  const [run, state] = useApiCall<T>(false);

  const execute = useCallback(
    (data: D, config?: AxiosRequestConfig, replacements: Replacements = {}) =>
      run(async () => {
        const response = await httpClient.post<BaseApiResponse<T>>(
          fillUrl(url, replacements),
          data,
          config,
        );
        return response.data;
      }),
    [url, run],
  );

  return [execute, state];
};

/** PUT/PATCH settle HTTP errors inside `createExecuteHandler`, so state reports `isSuccess` for them. */
function useAxiosBodyMutation<T, D>(
  url: string,
  method: 'put' | 'patch',
): ApiPostHookReturn<T, D> {
  const [run, state] = useApiCall<T>(false);

  const execute = useCallback(
    (data: D, config?: AxiosRequestConfig, replacements: Replacements = {}) =>
      run(() =>
        createExecuteHandler<T, D>(method)(
          fillUrl(url, replacements),
          data,
          config,
        ),
      ),
    [url, run, method],
  );

  return [execute, state];
}

export const useAxiosPut = <T, D = unknown>(
  url: string,
): ApiPostHookReturn<T, D> => useAxiosBodyMutation<T, D>(url, 'put');

export const useAxiosPatch = <T, D = unknown>(
  url: string,
): ApiPostHookReturn<T, D> => useAxiosBodyMutation<T, D>(url, 'patch');

export const useAxiosDelete = <T = void>(url: string): ApiHookReturn<T> => {
  const [run, state] = useApiCall<T>(false);

  const execute = useCallback(
    (config?: AxiosRequestConfig, replacements: Replacements = {}) =>
      run(() =>
        createExecuteHandler<T>('delete')(
          fillUrl(url, replacements),
          undefined,
          config,
        ),
      ),
    [url, run],
  );

  return [execute, state];
};
