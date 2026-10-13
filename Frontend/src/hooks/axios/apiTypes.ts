import type { AxiosError, AxiosRequestConfig } from 'axios';

export interface BaseApiResponse<T = unknown> {
  success: boolean;
  message: string;
  error: boolean;
  data: T;
  /**
   * Machine-readable error information, present only on handled CLIENT errors
   * (the backend withholds it on 5xx — see middlewares/errorHandler.ts).
   *
   * It exists so a caller can BRANCH rather than only display. AI_KEY_REQUIRED
   * is the case that forced it: "you have not added your API key" and "the AI
   * service is down" need different UI, and a message string cannot be
   * switched on without matching prose, which breaks the moment anyone edits
   * the copy.
   */
  details?: { code?: string; [key: string]: unknown };
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

export type ApiState<T> = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: AxiosError | null;
  data: T | null;
  meta?: BaseApiResponse<T>['meta'];
} & Pick<BaseApiResponse, 'message' | 'success'>;

export type ApiHookReturn<T> = [
  execute: (
    config?: AxiosRequestConfig,
    replacements?: { [key: string]: string },
  ) => Promise<BaseApiResponse<T>>,
  state: ApiState<T>,
];

export type ApiPostHookReturn<T, D> = [
  execute: (
    data: D,
    config?: AxiosRequestConfig,
    replacements?: { [key: string]: string },
  ) => Promise<BaseApiResponse<T>>,
  state: ApiState<T>,
];
