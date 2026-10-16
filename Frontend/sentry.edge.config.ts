// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import {
  scrubSentryEvent,
  SENTRY_TRACES_SAMPLE_RATE,
} from './src/lib/sentryScrub';

Sentry.init({
  dsn: 'https://b2457212bfce5f01cc4c450a340a19b3@o4511120779444224.ingest.us.sentry.io/4511120817324032',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Off: with it on, events carry request cookies and headers, which here
  // include the Supabase auth-token cookies. scrubSentryEvent strips them too.
  sendDefaultPii: false,
  beforeSend: scrubSentryEvent,
});
