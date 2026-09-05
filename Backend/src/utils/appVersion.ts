/**
 * Which commit is this process actually serving?
 *
 * WHY THIS EXISTS. A deploy that quietly stops updating keeps answering 200
 * from the previous build, and a health check that asserts status codes never
 * notices (the sibling KhataGO app lost a week that way). A checker can only
 * catch "live is behind main" if live says what commit it is — so /health
 * carries this in its JSON and as an `X-App-Commit` header.
 *
 * Values come from Vercel's system environment (VERCEL_GIT_COMMIT_SHA,
 * VERCEL_GIT_COMMIT_REF, VERCEL_ENV), which is what this backend deploys on.
 * Anything the platform did not provide reads `unknown` — never a guess.
 */

export const UNKNOWN_VERSION = 'unknown';

export const APP_COMMIT_HEADER = 'X-App-Commit';

export interface AppVersion {
  sha: string;
  shortSha: string;
  ref: string;
  env: string;
}

type Env = Record<string, string | undefined>;

const valueOrUnknown = (raw: string | undefined): string => {
  const v = raw?.trim();
  return v ? v : UNKNOWN_VERSION;
};

export function resolveAppVersion(env: Env = process.env): AppVersion {
  const sha = valueOrUnknown(env.VERCEL_GIT_COMMIT_SHA);
  return {
    sha,
    shortSha: sha === UNKNOWN_VERSION ? UNKNOWN_VERSION : sha.slice(0, 7),
    ref: valueOrUnknown(env.VERCEL_GIT_COMMIT_REF),
    env: valueOrUnknown(env.VERCEL_ENV),
  };
}
