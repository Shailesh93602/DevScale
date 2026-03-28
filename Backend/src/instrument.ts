import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Tracing
  tracesSampleRate: 1, // Capture 100% of the transactions during dev/testing
});
