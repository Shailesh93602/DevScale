/**
 * Which commit is this deployment actually serving?
 *
 * WHY THIS EXISTS. A deploy that quietly stops updating keeps answering 200
 * from the previous build, and a health check that asserts status codes never
 * notices — the sibling KhataGO app lost a week that way. A checker can only
 * catch "live is behind main" if live says what commit it is. /api/version is
 * that answer; this module is its single source.
 *
 * WHERE THE VALUES COME FROM, IN ORDER.
 *
 *   1. Vercel's system env at RUNTIME (VERCEL_GIT_COMMIT_SHA / _REF, VERCEL_ENV)
 *      — present in functions when the project exposes system env vars.
 *   2. The same variables BAKED AT BUILD by next.config.mjs `env`. The build
 *      step always has them (vercel.json's ignoreCommand relies on
 *      VERCEL_GIT_COMMIT_REF), so this survives a project where runtime
 *      exposure is off. The build timestamp exists ONLY here.
 *   3. `unknown`. Never a guess, never the request time.
 *
 * The baked reads below MUST stay literal `process.env.NAME` expressions: Next
 * substitutes exactly that syntax at build time, and a dynamic lookup would
 * silently read the (possibly empty) runtime environment instead.
 */

export const UNKNOWN_VERSION = 'unknown';

export const APP_COMMIT_HEADER = 'X-App-Commit';

export interface AppVersion {
  sha: string;
  shortSha: string;
  ref: string;
  /** Build time, ISO-8601 — not request time. */
  deployedAt: string;
  env: string;
}

export interface BakedBuildInfo {
  sha?: string;
  ref?: string;
  env?: string;
  builtAt?: string;
}

export const BUILD_BAKED: BakedBuildInfo = {
  sha: process.env.APP_BUILD_GIT_SHA,
  ref: process.env.APP_BUILD_GIT_REF,
  env: process.env.APP_BUILD_VERCEL_ENV,
  builtAt: process.env.APP_BUILD_TIME,
};

type Env = Record<string, string | undefined>;

function first(...candidates: Array<string | undefined>): string {
  for (const c of candidates) {
    const v = c?.trim();
    if (v) return v;
  }
  return UNKNOWN_VERSION;
}

export function resolveAppVersion(
  env: Env = process.env,
  baked: BakedBuildInfo = BUILD_BAKED,
): AppVersion {
  const sha = first(env.VERCEL_GIT_COMMIT_SHA, baked.sha);
  return {
    sha,
    shortSha: sha === UNKNOWN_VERSION ? UNKNOWN_VERSION : sha.slice(0, 7),
    ref: first(env.VERCEL_GIT_COMMIT_REF, baked.ref),
    deployedAt: first(baked.builtAt),
    env: first(env.VERCEL_ENV, baked.env),
  };
}

/**
 * /api/version response headers. `no-store` because a cached answer defeats
 * the point; `noindex` because a commit hash is nothing a search engine should
 * hold. (robots.txt already disallows /api/, so Google never fetches this and
 * never reads the tag — the header covers whatever does, and costs nothing.)
 */
export function versionResponseHeaders(
  version: AppVersion = resolveAppVersion(),
): Record<string, string> {
  return {
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    [APP_COMMIT_HEADER]: version.sha,
  };
}
