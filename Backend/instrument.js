/* eslint-disable @typescript-eslint/no-require-imports */
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Tracing
  tracesSampleRate: 1, //  Capture 100% of the transactions
});
