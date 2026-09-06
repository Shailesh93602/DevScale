import { describe, it, expect, afterEach } from '@jest/globals';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Request, Response, NextFunction } from 'express';

import {
  resolveRuntimeMode,
  isProduction,
  isDevelopment,
  useSecureCookies,
  describeModeMismatch,
} from '../../config/runtimeMode';
import { createMetricsHandler } from '../../middlewares/metricsEndpoint';
import { setCsrfToken } from '../../middlewares/csrfMiddleware';

/**
 * A production deployment must be hardened even when NODE_ENV is wrong.
 *
 * THE INCIDENT THIS ENCODES (2026-09-06). Commit `953fab9` was serving on two
 * production hosts at the same time. On `api-eduscale.vercel.app`,
 * NODE_ENV=production and everything was gated. On
 * `api.eduscale.exaveltech.com`, NODE_ENV was not `production`, and the same
 * build:
 *
 *   GET /metrics                  → 200, the full Prometheus registry (404 on the other host)
 *   GET /api/v1/debug-sentry      → 500 with a filesystem stack trace (404 on the other host)
 *   set-cookie: XSRF-TOKEN=…      → no `Secure` flag (present on the other host)
 *   content-security-policy       → absent (present on the other host)
 *   rate limit                    → 10,000 per window instead of 100
 *
 * Every one of those is a `process.env.NODE_ENV === 'production'` read. The
 * build was green and the deploy said Ready; nothing failed, because a missing
 * environment variable does not fail — it defaults.
 *
 * These tests are about the DEFAULT DIRECTION. A variable nobody set must not
 * be able to widen what the server allows.
 */

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('resolveRuntimeMode — production is the union of the two signals', () => {
  it('NODE_ENV=production alone is production', () => {
    const mode = resolveRuntimeMode({ NODE_ENV: 'production' });
    expect(mode.isProduction).toBe(true);
    expect(mode.nodeEnvMismatch).toBe(false);
  });

  it('THE INCIDENT: the platform says production and NODE_ENV does not — still production', () => {
    const mode = resolveRuntimeMode({
      VERCEL_ENV: 'production',
      VERCEL: '1',
      // NODE_ENV deliberately absent — this is the exact live configuration
      // of api.eduscale.exaveltech.com on 2026-09-06.
    });
    expect(mode.isProduction).toBe(true);
    expect(mode.useSecureCookies).toBe(true);
    expect(mode.isDevelopment).toBe(false);
    // and it is REPORTED, so the misconfiguration is visible rather than silent
    expect(mode.nodeEnvMismatch).toBe(true);
    expect(describeModeMismatch({ VERCEL_ENV: 'production' })).toContain(
      'NODE_ENV=(unset)'
    );
  });

  it('NODE_ENV=development on a production host does not downgrade it', () => {
    const mode = resolveRuntimeMode({
      NODE_ENV: 'development',
      VERCEL_ENV: 'production',
      VERCEL: '1',
    });
    expect(mode.isProduction).toBe(true);
    expect(mode.isDevelopment).toBe(false);
    expect(mode.nodeEnvMismatch).toBe(true);
  });

  it('a hosted PREVIEW is not production, but is not a developer machine either', () => {
    const mode = resolveRuntimeMode({ VERCEL_ENV: 'preview', VERCEL: '1' });
    expect(mode.isProduction).toBe(false);
    // No stack traces, no ungated /metrics on an internet-reachable preview.
    expect(mode.isDevelopment).toBe(false);
    // Every Vercel URL is HTTPS, so Secure always works there.
    expect(mode.useSecureCookies).toBe(true);
    expect(mode.nodeEnvMismatch).toBe(false);
  });

  it('a laptop is development: no Secure cookies (http://localhost would drop them)', () => {
    const mode = resolveRuntimeMode({ NODE_ENV: 'development' });
    expect(mode.isProduction).toBe(false);
    expect(mode.isDevelopment).toBe(true);
    expect(mode.useSecureCookies).toBe(false);
  });

  it('the test environment is neither production nor development', () => {
    const mode = resolveRuntimeMode({ NODE_ENV: 'test' });
    expect(mode.isProduction).toBe(false);
    expect(mode.isDevelopment).toBe(false);
    expect(mode.isTest).toBe(true);
  });

  it('an empty-string NODE_ENV reads as unset, not as a mode', () => {
    // A blank value in a dashboard is the likeliest misconfiguration of all.
    const mode = resolveRuntimeMode({
      NODE_ENV: '   ',
      VERCEL_ENV: 'production',
    });
    expect(mode.nodeEnv).toBeUndefined();
    expect(mode.isProduction).toBe(true);
  });

  it('the convenience wrappers read process.env at CALL time, not module load', () => {
    process.env.VERCEL_ENV = 'production';
    delete process.env.NODE_ENV;
    expect(isProduction()).toBe(true);
    expect(isDevelopment()).toBe(false);
    expect(useSecureCookies()).toBe(true);
  });
});

describe('the consequences, asserted on the real middleware', () => {
  it('/metrics is 404 on a platform-production host with NODE_ENV unset', async () => {
    // The live regression: this answered 200 with the whole registry.
    const handler = createMetricsHandler({
      token: undefined,
      isProduction: isProduction({ VERCEL_ENV: 'production', VERCEL: '1' }),
      contentType: 'text/plain',
      render: async () => '# HELP up 1\nup 1\n',
    });

    let status = 0;
    let body: unknown;
    const res = {
      status(code: number) {
        status = code;
        return this;
      },
      json(payload: unknown) {
        body = payload;
        return this;
      },
      set() {
        return this;
      },
      end() {
        return this;
      },
    };

    await handler({ headers: {} } as Request, res as unknown as Response);

    expect(status).toBe(404);
    expect(body).toEqual({ message: 'Route not found' });
  });

  it('the CSRF cookie carries Secure on a platform-production host with NODE_ENV unset', () => {
    process.env.VERCEL_ENV = 'production';
    process.env.VERCEL = '1';
    delete process.env.NODE_ENV;

    let options: Record<string, unknown> | undefined;
    const req = { cookies: {} } as unknown as Request;
    const res = {
      cookie(_name: string, _value: string, opts: Record<string, unknown>) {
        options = opts;
      },
    } as unknown as Response;

    setCsrfToken(req, res, (() => {}) as NextFunction);

    // Live regression: `XSRF-TOKEN=…; Path=/; SameSite=Strict` — no Secure.
    expect(options).toMatchObject({ secure: true, sameSite: 'strict' });
  });
});

/**
 * The ratchet. A security decision made from a raw `process.env.NODE_ENV` read
 * is the defect itself, not a style problem — so new ones fail here rather than
 * being found on a live host months later.
 *
 * The allow-list is exhaustive and every entry is justified. Adding to it is a
 * deliberate act; the default for new code is `config/runtimeMode`.
 */
const ALLOWED_RAW_NODE_ENV_READS: Record<string, string> = {
  // Cache the PrismaClient on globalThis outside production so a dev-server
  // reload does not open a new pool. Not a security decision, and harmless in
  // either direction.
  'prisma.ts': 'globalThis client caching + query log level',
  [join('lib', 'prisma.ts')]: 'globalThis client caching + query log level',
  // Legitimately asks "am I under jest", which is what NODE_ENV=test means and
  // is not something runtimeMode should paper over.
  [join('utils', 'securityUtils.ts')]: 'skips a check under NODE_ENV=test',
};

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'tests' || entry === 'node_modules') continue;
      sourceFiles(full, acc);
    } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
      acc.push(full);
    }
  }
  return acc;
}

/** Lines that are wholly a comment do not make a decision. */
function isCommentLine(line: string): boolean {
  const t = line.trim();
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*');
}

describe('no security decision reads process.env.NODE_ENV directly', () => {
  it('every remaining raw read is on the justified allow-list', () => {
    const srcRoot = join(__dirname, '..', '..');
    const offenders: string[] = [];

    for (const file of sourceFiles(srcRoot)) {
      const rel = relative(srcRoot, file);
      if (rel === join('config', 'runtimeMode.ts')) continue; // the one place that may
      const hit = readFileSync(file, 'utf8')
        .split('\n')
        .some(
          (line) =>
            !isCommentLine(line) && line.includes('process.env.NODE_ENV')
        );
      if (hit && !(rel in ALLOWED_RAW_NODE_ENV_READS)) {
        offenders.push(rel.split(sep).join('/'));
      }
    }

    expect(offenders).toEqual([]);
  });

  it('the allow-list has not rotted — every entry still contains a raw read', () => {
    // An allow-list nobody prunes eventually permits things that are gone,
    // and then permits their replacements by accident.
    const srcRoot = join(__dirname, '..', '..');
    for (const rel of Object.keys(ALLOWED_RAW_NODE_ENV_READS)) {
      const contents = readFileSync(join(srcRoot, rel), 'utf8');
      expect(contents.includes('process.env.NODE_ENV')).toBe(true);
    }
  });
});
