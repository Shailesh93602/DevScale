import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://9453e9c448ab5854a2ecbb06126f192f@o4511120779444224.ingest.us.sentry.io/4511120858218496",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
});
