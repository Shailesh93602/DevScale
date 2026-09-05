import {
  describe,
  it,
  expect,
  jest,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals';
import express from 'express';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { resolveAppVersion, UNKNOWN_VERSION } from '../../utils/appVersion';

/**
 * /api/v1/health reports WHICH BUILD answered.
 *
 * The health checks themselves (postgres / redis / queue) are unchanged and
 * not the subject here; they are mocked green so the assertions below are
 * about the version block alone: it is present, it comes from Vercel's system
 * env, and it reads `unknown` — never something invented — when the platform
 * set nothing. A stale deploy answering 200 is exactly the case a checker
 * needs this field for, so the field must be trustworthy in both states.
 */

const SHA = '43a6e0be1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f';

// ─── Mock config (dotenv would otherwise load the repo's .env) ──────────────
jest.mock('../../config', () => ({
  NODE_ENV: 'test',
  REDIS_URL: 'redis://localhost:6379',
}));

// ─── Mock Prisma / Redis / Bull — the checks are green by construction ──────
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }] as never),
    $disconnect: jest.fn(),
  },
}));
jest.mock('../../services/cacheService', () => ({
  redis: {
    ping: jest.fn().mockResolvedValue('PONG' as never),
    status: 'ready',
    quit: jest.fn(),
  },
}));
jest.mock('bull', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    isReady: jest.fn().mockResolvedValue(undefined as never),
    close: jest.fn().mockResolvedValue(undefined as never),
  })),
}));

const VERSION_ENV = [
  'VERCEL_GIT_COMMIT_SHA',
  'VERCEL_GIT_COMMIT_REF',
  'VERCEL_ENV',
] as const;
const saved: Record<string, string | undefined> = {};

describe('resolveAppVersion', () => {
  it('reads Vercel system env and derives shortSha', () => {
    expect(
      resolveAppVersion({
        VERCEL_GIT_COMMIT_SHA: SHA,
        VERCEL_GIT_COMMIT_REF: 'main',
        VERCEL_ENV: 'production',
      })
    ).toEqual({
      sha: SHA,
      shortSha: '43a6e0b',
      ref: 'main',
      env: 'production',
    });
  });

  it('is `unknown` everywhere when nothing is set — never a guess', () => {
    expect(resolveAppVersion({})).toEqual({
      sha: UNKNOWN_VERSION,
      shortSha: UNKNOWN_VERSION,
      ref: UNKNOWN_VERSION,
      env: UNKNOWN_VERSION,
    });
  });

  it('treats blank values as unset', () => {
    const v = resolveAppVersion({
      VERCEL_GIT_COMMIT_SHA: '  ',
      VERCEL_ENV: '',
    });
    expect(v.sha).toBe(UNKNOWN_VERSION);
    expect(v.shortSha).toBe(UNKNOWN_VERSION);
    expect(v.env).toBe(UNKNOWN_VERSION);
  });
});

describe('GET /api/v1/health', () => {
  let server: Server;
  let base: string;

  beforeAll(async () => {
    // The real router, mounted where routes.ts mounts it, behind a real
    // socket — the response a checker would actually receive.
    const { HealthCheckRoutes } = await import(
      '../../routes/healthCheckRoutes'
    );
    const app = express();
    app.use('/api/v1/health', new HealthCheckRoutes().getRouter());
    server = app.listen(0);
    const { port } = server.address() as AddressInfo;
    base = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  beforeEach(() => {
    for (const name of VERSION_ENV) {
      saved[name] = process.env[name];
      delete process.env[name];
    }
  });

  afterEach(() => {
    for (const name of VERSION_ENV) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  });

  it('carries the version block and X-App-Commit from the platform env, with the checks unchanged', async () => {
    process.env.VERCEL_GIT_COMMIT_SHA = SHA;
    process.env.VERCEL_GIT_COMMIT_REF = 'main';
    process.env.VERCEL_ENV = 'production';

    const res = await fetch(`${base}/api/v1/health`);
    const body = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.checks).toEqual({ postgres: 'ok', redis: 'ok', queue: 'ok' });
    expect(body.version).toEqual({
      sha: SHA,
      shortSha: '43a6e0b',
      ref: 'main',
      env: 'production',
    });
    expect(res.headers.get('x-app-commit')).toBe(SHA);
  });

  it('reports `unknown` when the platform set nothing', async () => {
    const res = await fetch(`${base}/api/v1/health`);
    const body = (await res.json()) as { version: unknown };

    expect(res.status).toBe(200);
    expect(body.version).toEqual({
      sha: UNKNOWN_VERSION,
      shortSha: UNKNOWN_VERSION,
      ref: UNKNOWN_VERSION,
      env: UNKNOWN_VERSION,
    });
    expect(res.headers.get('x-app-commit')).toBe(UNKNOWN_VERSION);
  });

  it('leaves /ready as it was — a liveness probe with no version block', async () => {
    const res = await fetch(`${base}/api/v1/health/ready`);
    const body = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.status).toBe('ready');
    expect(body).not.toHaveProperty('version');
  });
});
