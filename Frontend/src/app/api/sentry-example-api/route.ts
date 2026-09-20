import * as Sentry from '@sentry/nextjs';
export const dynamic = 'force-dynamic';

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = 'SentryExampleAPIError';
  }
}

/**
 * A faulty API route to test Sentry's error monitoring — OUTSIDE PRODUCTION.
 *
 * 🔴 In production this answered 404 to nobody and 500 to everybody. It is
 * unauthenticated, takes no input, and throws on every single GET, so anyone
 * who knows the path (it is the Sentry wizard's default, so everyone does) can
 * hold down refresh and fill the error tracker — and every alert built on it —
 * with events indistinguishable from a real incident, while burning the Sentry
 * event quota that a real incident would need.
 *
 * This is not a new judgement. The backend reached it first and acted on it:
 * `Backend/src/routes/routes.ts` registers its twin, `/api/v1/debug-sentry`,
 * inside `if (!isProduction())` with a comment making exactly this argument.
 * The frontend half of the same pair was left registered. Same decision, both
 * halves now.
 *
 * 404 rather than 403: in production this endpoint does not exist, and saying
 * so is both true and the same thing the backend does by not registering the
 * route at all.
 *
 * `process.env.NODE_ENV` is read INSIDE the handler, not hoisted to a module
 * constant, so the behaviour is decided per request and is observable by a
 * test. Next.js sets NODE_ENV=production for every production build, so unlike
 * the backend — which is deployed to a host that sets VERCEL_ENV and not
 * NODE_ENV — this single signal is reliable here.
 */
export function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new Response(null, { status: 404 });
  }

  Sentry.logger.info('Sentry example API called');
  throw new SentryExampleAPIError(
    'This error is raised on the backend called by the example page.',
  );
}
