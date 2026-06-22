import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {
  requiresAuthRoute,
  isPublicRoute,
  isGuestOnlyRoute,
} from '../src/lib/public-routes';

/**
 * ES-04 — /resources and /career-roadmap must be auth-required so the server
 * middleware redirects unauthenticated visitors to /auth/login?callbackUrl=...
 * (verified at runtime via curl: GET /resources → 307 →
 * /auth/login?callbackUrl=%2Fresources). Here we lock the routing logic that
 * drives that redirect — pure, no server needed.
 */
test.describe('ES-04: protected routes are auth-gated', () => {
  for (const route of ['/resources', '/career-roadmap']) {
    test(`${route} requires auth (middleware will redirect)`, () => {
      expect(requiresAuthRoute(route)).toBe(true);
      expect(isPublicRoute(route)).toBe(false);
      expect(isGuestOnlyRoute(route)).toBe(false);
    });
  }
});

/**
 * ES-FE-02 (extended) — no fabricated social proof in the public landing/about
 * source. EduScale is a new product; it must not claim user counts, customer
 * logos, or fake testimonials. (pricing/page.tsx is intentionally excluded —
 * its logo block is owned by the open PR #2.)
 */
test.describe('No fabricated social proof in landing/about source', () => {
  const root = path.join(__dirname, '..', 'src');
  const files = [
    'constants/branding.ts',
    'components/Landing/CTASection.tsx',
    'components/Landing/HeroSection.tsx',
    'components/Landing/CommunitySection.tsx',
    'components/ui/stats-showcase.tsx',
    'components/Landing/SimpleWeeklyLeaderboard.tsx',
    'app/about/page.tsx',
  ];
  const forbidden = [
    '10,000+',
    '25,000+',
    'Active Students',
    'Active Users',
    'Trusted by students from',
    'Join thousands of engineering students',
    'Rahul Sharma',
    'Priya Patel',
    'Arjun Mehta',
    'FAANG engineers',
  ];

  for (const rel of files) {
    test(`${rel} has no fabricated proof`, () => {
      const src = fs.readFileSync(path.join(root, rel), 'utf8');
      for (const phrase of forbidden) {
        expect(src, `${rel} must not contain "${phrase}"`).not.toContain(
          phrase,
        );
      }
    });
  }
});
