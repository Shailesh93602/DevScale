import { describe, it, expect } from '@jest/globals';
import type { Router } from 'express';

import { ChallengeRoutes } from '../../routes/challengeRoutes';
import { RoadMapRoutes } from '../../routes/roadMapRoutes';
import { RatingRoutes } from '../../routes/ratingRoutes';

/**
 * The anonymous read-only surface — exactly what a signed-out visitor may
 * read, and nothing more.
 *
 * The owner's decision (2026-09-03): a visitor may browse roadmaps (list and
 * detail, including comments), the challenge LIST, and the public rating
 * leaderboard. Solving a challenge, submitting, liking, enrolling, commenting
 * and every admin mutation stay authenticated.
 *
 * Both directions are asserted. A test that only checked "these are open"
 * would pass if someone opened everything; one that only checked "these are
 * closed" would pass if the public routes silently regained authMiddleware
 * and the visitor view went back to a login wall. Introspecting the real
 * Express router (same technique as adminRouteContract.test.ts) means the
 * list here cannot drift from what is actually mounted.
 */

interface Layer {
  name?: string;
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: Array<{ name?: string }>;
  };
}

function routerLevelMiddleware(router: Router): string[] {
  return ((router as unknown as { stack: Layer[] }).stack ?? [])
    .filter((layer) => !layer.route)
    .map((layer) => layer.name ?? '<anonymous>');
}

function routes(router: Router) {
  const out: Array<{ key: string; handlers: string[] }> = [];
  for (const layer of (router as unknown as { stack: Layer[] }).stack ?? []) {
    if (!layer.route) continue;
    for (const method of Object.keys(layer.route.methods)) {
      out.push({
        key: `${method.toUpperCase()} ${layer.route.path}`,
        handlers: layer.route.stack.map((h) => h.name ?? '<anonymous>'),
      });
    }
  }
  return out;
}

function guardOf(
  router: Router,
  key: string
): 'required' | 'optional' | 'none' {
  const routerMw = routerLevelMiddleware(router);
  const route = routes(router).find((r) => r.key === key);
  if (!route) throw new Error(`route ${key} is not declared`);
  const chain = [...routerMw, ...route.handlers];
  if (chain.includes('authMiddleware')) return 'required';
  if (chain.includes('optionalAuthMiddleware')) return 'optional';
  return 'none';
}

describe('challengeRoutes — anonymous read-only surface', () => {
  const router = new ChallengeRoutes().getRouter();

  it('no longer authenticates at the router level (each route decides)', () => {
    expect(routerLevelMiddleware(router)).not.toContain('authMiddleware');
  });

  it('the listing and its categories are readable signed out', () => {
    expect(guardOf(router, 'GET /')).toBe('none');
    expect(guardOf(router, 'GET /categories')).toBe('none');
  });

  it('solving stays gated: the problem body, the leaderboard and every write', () => {
    expect(guardOf(router, 'GET /:id')).toBe('required');
    expect(guardOf(router, 'GET /leaderboard')).toBe('required');
    expect(guardOf(router, 'POST /:challengeId/submit')).toBe('required');
    expect(guardOf(router, 'POST /')).toBe('required');
    expect(guardOf(router, 'PATCH /:id')).toBe('required');
  });

  it('every non-GET route is authenticated (no new write can slip in open)', () => {
    const open = routes(router)
      .filter((r) => !r.key.startsWith('GET '))
      .filter((r) => guardOf(router, r.key) !== 'required')
      .map((r) => r.key);
    expect(open).toEqual([]);
  });
});

describe('roadMapRoutes — anonymous read-only surface', () => {
  const router = new RoadMapRoutes().getRouter();

  it('list, detail and comments are readable signed out; detail/comments still identify a signed-in reader', () => {
    expect(guardOf(router, 'GET /')).toBe('none');
    // optional, not none: the controller passes req.user?.id through so a
    // member still gets isLiked / isBookmarked / progress on the same route.
    expect(guardOf(router, 'GET /:id')).toBe('optional');
    expect(guardOf(router, 'GET /:id/comments')).toBe('optional');
  });

  it('personalised reads and every write stay authenticated', () => {
    expect(guardOf(router, 'GET /categories')).toBe('required');
    expect(guardOf(router, 'GET /:id/main-concepts')).toBe('required');
    const open = routes(router)
      .filter((r) => !r.key.startsWith('GET '))
      .filter((r) => guardOf(router, r.key) !== 'required')
      .map((r) => r.key);
    expect(open).toEqual([]);
  });
});

describe('ratingRoutes — the public leaderboard', () => {
  const router = new RatingRoutes().getRouter();

  it('the leaderboard is public and /me is not', () => {
    expect(guardOf(router, 'GET /leaderboard')).toBe('none');
    expect(guardOf(router, 'GET /me')).toBe('required');
  });
});
