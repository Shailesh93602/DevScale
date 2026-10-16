import type { ErrorEvent } from '@sentry/nextjs';

const SECRET_HEADERS = new Set(['authorization', 'cookie', 'set-cookie']);

/**
 * Shared Sentry `beforeSend`: the request's cookies carry the Supabase
 * `sb-*-auth-token` (access AND refresh token), and Authorization carries the
 * bearer. Neither belongs in an error report.
 */
export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  const request = event.request;
  if (request) {
    delete request.cookies;
    if (request.headers) {
      for (const name of Object.keys(request.headers)) {
        if (SECRET_HEADERS.has(name.toLowerCase()))
          delete request.headers[name];
      }
    }
  }
  return event;
}

export const SENTRY_TRACES_SAMPLE_RATE =
  process.env.NODE_ENV === 'production' ? 0.1 : 1;
