import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { legacyRedirects } from './legacy-redirects.mjs';
import { isGuestOnlyRoute } from './public-routes';

/**
 * The hand-typed auth URLs must land on the real auth pages with a permanent
 * redirect — and must be wired into next.config, not just defined.
 *
 * The second half matters more than the first. Two page stubs existed for
 * /login and /signup and were "correct" in isolation while the live site
 * served /login as a 200 empty shell. A redirect list nobody imports is the
 * same bug with extra steps, so this test reads next.config.mjs from disk.
 */
describe('legacy auth redirects', () => {
  const bySource = Object.fromEntries(
    legacyRedirects.map((r) => [r.source, r]),
  );

  it('covers every URL a visitor is likely to type', () => {
    for (const source of ['/login', '/register', '/signup', '/sign-up']) {
      expect(bySource[source], `${source} is not redirected`).toBeDefined();
    }
  });

  it('every destination is a guest-only auth page and every redirect is permanent', () => {
    for (const r of legacyRedirects) {
      expect(isGuestOnlyRoute(r.destination), r.destination).toBe(true);
      expect(r.permanent, `${r.source} should be a 308`).toBe(true);
    }
  });

  it('login goes to login and the three sign-up spellings go to register', () => {
    expect(bySource['/login'].destination).toBe('/auth/login');
    for (const s of ['/register', '/signup', '/sign-up']) {
      expect(bySource[s].destination).toBe('/auth/register');
    }
  });

  it('is wired into next.config.mjs (a list nobody imports redirects nothing)', () => {
    const config = fs.readFileSync(
      path.join(__dirname, '..', '..', 'next.config.mjs'),
      'utf8',
    );
    expect(config).toMatch(/legacyRedirects/);
    expect(config).toMatch(/async redirects\(\)/);
  });

  it('no page stub shadows an edge redirect', () => {
    // A src/app/login/page.tsx would win over the redirect for a soft
    // navigation and lose for a hard one — two behaviours for one URL.
    const appDir = path.join(__dirname, '..', 'app');
    for (const r of legacyRedirects) {
      const stub = path.join(appDir, r.source.slice(1), 'page.tsx');
      expect(fs.existsSync(stub), `${stub} should not exist`).toBe(false);
    }
  });
});
