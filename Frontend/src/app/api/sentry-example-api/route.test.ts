import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GET } from './route';

vi.mock('@sentry/nextjs', () => ({
  logger: { info: vi.fn() },
}));

afterEach(() => {
  vi.unstubAllEnvs();
});

/**
 * This endpoint throws on every GET by design — it exists to prove the error
 * pipeline works. Left registered in production it is an unauthenticated,
 * input-free 500 generator on a path the Sentry wizard gives every project, so
 * anyone can flood the error tracker and the alerts built on it with events
 * that look exactly like a real incident.
 *
 * The backend already reached that conclusion and acted on it for its twin
 * (`/api/v1/debug-sentry`, registered inside `if (!isProduction())`). These
 * tests hold the frontend half to the same decision.
 */
describe('GET /api/sentry-example-api', () => {
  it('still throws outside production, so the smoke test keeps working', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(() => GET()).toThrow(
      'This error is raised on the backend called by the example page.',
    );
  });

  it('does not exist in production — 404, and nothing is thrown', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const res = GET() as Response;
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(404);
  });

  it('decides per request, not once at module load', () => {
    // If the environment were read into a module constant, the value captured
    // at import time would win and stubbing would do nothing — the test would
    // pass while production behaviour was fixed at whatever NODE_ENV was when
    // the module first loaded. Flipping it twice in one test proves otherwise.
    vi.stubEnv('NODE_ENV', 'production');
    expect((GET() as Response).status).toBe(404);
    vi.stubEnv('NODE_ENV', 'development');
    expect(() => GET()).toThrow();
  });

  it('the backend twin it mirrors is still gated too', () => {
    // A one-sided fix is how this pair drifted apart in the first place. If
    // someone ungates /api/v1/debug-sentry, this says so here rather than
    // leaving the two halves silently inconsistent again.
    const routes = readFileSync(
      join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        '..',
        'Backend',
        'src',
        'routes',
        'routes.ts',
      ),
      'utf8',
    );
    expect(routes).toMatch(/if\s*\(\s*!isProduction\(\)\s*\)/);
    const gatedBlock = routes.slice(routes.indexOf('if (!isProduction())'));
    expect(gatedBlock).toMatch(/debug-sentry/);
  });
});
