import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveAppVersion, UNKNOWN_VERSION } from '@/lib/app-version';

/**
 * /api/version — the property under test is not "it returns JSON". It is that
 * a checker can trust the answer: every field comes from the platform or reads
 * `unknown`, nothing is computed per request, and the response is neither
 * cacheable nor indexable. A version endpoint a CDN caches reports the OLD
 * commit — the exact blind spot this route exists to remove.
 */

const SHA = '43a6e0be1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f';

const VERCEL_ENV_VARS = {
  VERCEL_GIT_COMMIT_SHA: SHA,
  VERCEL_GIT_COMMIT_REF: 'main',
  VERCEL_ENV: 'production',
};

/** Nothing from the platform, nothing baked at build. */
function clearPlatformEnv() {
  for (const name of [
    'VERCEL_GIT_COMMIT_SHA',
    'VERCEL_GIT_COMMIT_REF',
    'VERCEL_ENV',
    'APP_BUILD_GIT_SHA',
    'APP_BUILD_GIT_REF',
    'APP_BUILD_VERCEL_ENV',
    'APP_BUILD_TIME',
  ]) {
    vi.stubEnv(name, '');
  }
}

beforeEach(() => {
  vi.resetModules();
  clearPlatformEnv();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('resolveAppVersion', () => {
  it('reads Vercel runtime env and derives shortSha; deployedAt is the build time', () => {
    expect(
      resolveAppVersion(VERCEL_ENV_VARS, {
        builtAt: '2026-09-05T10:00:00.000Z',
      }),
    ).toEqual({
      sha: SHA,
      shortSha: '43a6e0b',
      ref: 'main',
      deployedAt: '2026-09-05T10:00:00.000Z',
      env: 'production',
    });
  });

  it('is `unknown` everywhere when nothing is set — never a guess', () => {
    expect(resolveAppVersion({}, {})).toEqual({
      sha: UNKNOWN_VERSION,
      shortSha: UNKNOWN_VERSION,
      ref: UNKNOWN_VERSION,
      deployedAt: UNKNOWN_VERSION,
      env: UNKNOWN_VERSION,
    });
  });

  it('prefers the runtime env over the build-baked values, and blanks count as unset', () => {
    const baked = {
      sha: 'baked000' + '0'.repeat(32),
      ref: 'baked-ref',
      env: 'preview',
    };
    expect(resolveAppVersion(VERCEL_ENV_VARS, baked).sha).toBe(SHA);
    const fromBuild = resolveAppVersion({ VERCEL_GIT_COMMIT_SHA: '  ' }, baked);
    expect(fromBuild.sha).toBe(baked.sha);
    expect(fromBuild.ref).toBe('baked-ref');
    expect(fromBuild.env).toBe('preview');
  });

  it('deployedAt comes ONLY from the build — a runtime value cannot fake it', () => {
    // If this ever passes through, "deployedAt" has come to mean "now", which
    // is the value a stale deploy would also report.
    const v = resolveAppVersion(
      { ...VERCEL_ENV_VARS, APP_BUILD_TIME: '2026-01-01T00:00:00.000Z' },
      {},
    );
    expect(v.deployedAt).toBe(UNKNOWN_VERSION);
  });
});

describe('GET /api/version', () => {
  const get = async () => {
    const { GET } = await import('./route');
    return GET();
  };

  it('returns the platform values with no-store, noindex and X-App-Commit', async () => {
    for (const [k, v] of Object.entries(VERCEL_ENV_VARS)) vi.stubEnv(k, v);

    const res = await get();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      sha: SHA,
      shortSha: '43a6e0b',
      ref: 'main',
      env: 'production',
    });
    expect(Object.keys(body).sort()).toEqual(
      ['deployedAt', 'env', 'ref', 'sha', 'shortSha'].sort(),
    );
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('x-robots-tag')).toMatch(/noindex/);
    expect(res.headers.get('x-app-commit')).toBe(SHA);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
  });

  it('returns `unknown` for every field when the platform set nothing', async () => {
    const res = await get();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      sha: UNKNOWN_VERSION,
      shortSha: UNKNOWN_VERSION,
      ref: UNKNOWN_VERSION,
      deployedAt: UNKNOWN_VERSION,
      env: UNKNOWN_VERSION,
    });
    expect(res.headers.get('x-app-commit')).toBe(UNKNOWN_VERSION);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('is declared dynamic, so it is never pre-rendered at build', async () => {
    const mod = await import('./route');
    expect(mod.dynamic).toBe('force-dynamic');
  });
});
