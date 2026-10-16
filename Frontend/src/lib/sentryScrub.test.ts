import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ErrorEvent } from '@sentry/nextjs';

const init = vi.hoisted(() => vi.fn());
vi.mock('@sentry/nextjs', () => ({
  init,
  replayIntegration: () => ({}),
  captureRouterTransitionStart: vi.fn(),
}));

// Execute every Sentry.init the app actually runs and inspect its options.
const CONFIGS = {
  server: () => import('../../sentry.server.config'),
  edge: () => import('../../sentry.edge.config'),
  client: () => import('../instrumentation-client'),
};

const leakyEvent = (): ErrorEvent => ({
  type: undefined,
  request: {
    url: 'https://eduscale.vercel.app/dashboard',
    cookies: { 'sb-abc-auth-token': 'access+refresh' },
    headers: {
      Cookie: 'sb-abc-auth-token=access+refresh',
      authorization: 'Bearer jwt',
      'user-agent': 'x',
    },
  },
});

describe('Sentry init options', () => {
  beforeEach(() => {
    init.mockReset();
    vi.resetModules();
  });

  it.each(Object.keys(CONFIGS) as Array<keyof typeof CONFIGS>)(
    '%s config sends no auth cookies or headers',
    async (name) => {
      await CONFIGS[name]();
      expect(init).toHaveBeenCalledTimes(1);
      const opts = init.mock.calls[0][0];
      expect(opts.sendDefaultPii).toBe(false);
      expect(opts.tracesSampleRate).toBe(1); // NODE_ENV=test, not production
      const out = opts.beforeSend(leakyEvent(), {});
      expect(out.request.cookies).toBeUndefined();
      expect(out.request.headers).toEqual({ 'user-agent': 'x' });
      expect(out.request.url).toBe('https://eduscale.vercel.app/dashboard');
    },
  );

  it('the never-loaded sentry.client.config.ts is gone', () => {
    // Turbopack never loads it; under webpack it would init Sentry twice.
    expect(existsSync(join(process.cwd(), 'sentry.client.config.ts'))).toBe(
      false,
    );
  });
});
