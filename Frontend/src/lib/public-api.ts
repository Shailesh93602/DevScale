/**
 * Server-side reads of the PUBLIC backend endpoints, for server components.
 *
 * The client code goes through hooks/useAxios (token injection, CSRF, 401
 * handling). None of that applies on the server for anonymous reads, and a
 * server component cannot use hooks anyway, so this is a thin `fetch` with
 * three properties the read-only pages rely on:
 *
 *   1. It never throws. A visitor's first page must render whether or not the
 *      API is awake; a failed read yields `null` and the page shows an honest
 *      "could not load" state rather than a 500.
 *   2. It is cached by Next's data cache with a short revalidation window, so
 *      a crawler or a burst of visitors does not fan out to the backend.
 *   3. It sends no credentials. These are the endpoints the backend serves to
 *      anyone; if one of them ever starts requiring auth again, the page shows
 *      its error state and the e2e for anonymous access fails — which is the
 *      right way to find out.
 */

const DEFAULT_BASE = 'http://localhost:5000/api/v1';

export function apiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE).replace(
    /\/$/,
    '',
  );
}

export interface PublicListResponse<T> {
  data: T[];
  meta?: {
    total?: number;
    currentPage?: number;
    totalPages?: number;
    limit?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    [key: string]: unknown;
  };
}

export async function fetchPublic<T>(
  path: string,
  { revalidate = 300 }: { revalidate?: number } = {},
): Promise<T | null> {
  try {
    const res = await fetch(`${apiBaseUrl()}${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
