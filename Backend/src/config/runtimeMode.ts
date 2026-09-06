/**
 * Is this process running in production? — one answer, asked in one place.
 *
 * WHY THIS EXISTS.
 *
 * Every production security control in this backend used to be gated on
 * `process.env.NODE_ENV === 'production'`, read independently in a dozen
 * files: the CSP, COEP, the `Secure` flag on the auth and CSRF cookies, the
 * rate-limit ceilings, the strict CORS branch, whether stack traces reach the
 * client, whether `/metrics` is gated, and whether the always-throwing
 * `/debug-sentry` route is mounted.
 *
 * `NODE_ENV` is not something the hosting platform guarantees. Vercel sets
 * `VERCEL_ENV`; `NODE_ENV` is whatever the project's environment variables
 * happen to say, per project. On 2026-09-06 the same commit (`953fab9`) was
 * serving on two production hosts:
 *
 *   api-eduscale.vercel.app       NODE_ENV=production    hardened
 *   api.eduscale.exaveltech.com   NODE_ENV≠production    NOT hardened
 *
 * and the second one publicly served `/metrics` (200, the full route table and
 * latency histograms), answered `/api/v1/debug-sentry` with a 500 carrying a
 * filesystem stack trace, set `XSRF-TOKEN` with no `Secure` flag, sent no
 * Content-Security-Policy, and ran the rate limiter at 10,000 requests per
 * window instead of 100. Nothing failed. The build was green, the deploy said
 * Ready, and the only visible trace was the word "development" in a health
 * response that nobody reads.
 *
 * THE RULE.
 *
 * A missing or mistyped environment variable must not be able to silently
 * *widen* what the server allows. So production is the union of the two
 * signals, not `NODE_ENV` alone: if either the runtime or the platform says
 * production, the hardened path is taken. Getting `NODE_ENV` wrong now costs
 * a log line and a slightly noisier logger, not the security posture.
 *
 * This module reads `process.env` and nothing else — no imports, no dotenv, no
 * logger — so it is safe to use from anywhere, including the modules that
 * bootstrap logging and configuration.
 */

type Env = Record<string, string | undefined>;

export interface RuntimeMode {
  /** Effective answer. True when NODE_ENV **or** the platform says production. */
  isProduction: boolean;
  /**
   * True only when this is a developer's machine — not production, and not a
   * hosted preview. Guards developer conveniences (stack traces in responses,
   * an ungated `/metrics`), which must stay off everywhere else.
   */
  isDevelopment: boolean;
  /** True under `NODE_ENV=test`. */
  isTest: boolean;
  /**
   * Should cookies carry `Secure`? True in production and on ANY hosted
   * deployment: every Vercel URL is HTTPS-only, so `Secure` always works
   * there, and a preview that drops it is the same defect one environment
   * over. False on a laptop, where http://localhost would otherwise refuse
   * the cookie.
   */
  useSecureCookies: boolean;
  /** Raw `NODE_ENV`, or `undefined` when unset. Reported, never trusted alone. */
  nodeEnv: string | undefined;
  /** Raw `VERCEL_ENV` (`production` | `preview` | `development`), if hosted. */
  platformEnv: string | undefined;
  /**
   * The platform says production and `NODE_ENV` disagrees. Behaviour is
   * already correct when this is true — it is surfaced so the misconfiguration
   * is visible (startup log, `/api/v1/health`) instead of silent.
   */
  nodeEnvMismatch: boolean;
}

export function resolveRuntimeMode(env: Env = process.env): RuntimeMode {
  const nodeEnv = env.NODE_ENV?.trim() || undefined;
  const platformEnv = env.VERCEL_ENV?.trim() || undefined;

  const nodeSaysProduction = nodeEnv === 'production';
  const platformSaysProduction = platformEnv === 'production';
  const isProduction = nodeSaysProduction || platformSaysProduction;

  // `VERCEL` is set to "1" on every Vercel deployment regardless of target.
  const isHosted = Boolean(env.VERCEL?.trim()) || platformEnv !== undefined;

  return {
    isProduction,
    isDevelopment: !isProduction && !isHosted && nodeEnv !== 'test',
    isTest: nodeEnv === 'test',
    useSecureCookies: isProduction || isHosted,
    nodeEnv,
    platformEnv,
    nodeEnvMismatch: platformSaysProduction && !nodeSaysProduction,
  };
}

/** Effective production flag. Reads `process.env` at call time. */
export const isProduction = (env?: Env): boolean =>
  resolveRuntimeMode(env).isProduction;

/** True only on a developer's machine — never on a hosted deployment. */
export const isDevelopment = (env?: Env): boolean =>
  resolveRuntimeMode(env).isDevelopment;

/** Whether to set the `Secure` flag on cookies. */
export const useSecureCookies = (env?: Env): boolean =>
  resolveRuntimeMode(env).useSecureCookies;

/**
 * One line naming the effective mode, for a startup log. Returns `null` when
 * there is nothing worth saying.
 */
export function describeModeMismatch(env?: Env): string | null {
  const mode = resolveRuntimeMode(env);
  if (!mode.nodeEnvMismatch) return null;
  return (
    `VERCEL_ENV=production but NODE_ENV=${mode.nodeEnv ?? '(unset)'} — ` +
    'treating this deployment as PRODUCTION (hardened) anyway. Set NODE_ENV=production ' +
    'on this Vercel project so the two agree; until then logging is more verbose than production should be.'
  );
}
