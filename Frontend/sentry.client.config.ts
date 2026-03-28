// This file runs in the browser. It must be imported by Next.js automatically —
// Sentry's webpack plugin handles this via next.config.mjs withSentryConfig.

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Only initialise when a DSN is configured (keeps dev/test noise-free)
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',

    // Capture 10% of transactions in production, 100% in dev
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Replay 1% of sessions, 100% of sessions with an error
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true, // mask PII in replays
        blockAllMedia: true,
      }),
    ],

    // Don't send errors caused by browser extensions or bots
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],

    beforeSend(event) {
      // Strip auth tokens from breadcrumbs/request data before sending
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
      return event;
    },
  });
}
