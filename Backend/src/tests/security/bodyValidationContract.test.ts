import { describe, it, expect } from '@jest/globals';
import type { Router } from 'express';
import { AdminRoutes } from '../../routes/adminRoutes';
import { RoadMapRoutes } from '../../routes/roadMapRoutes';
import { ArticleRoutes } from '../../routes/articleRoutes';
import { ChallengeRoutes } from '../../routes/challengeRoutes';

/**
 * Every route that reads a request body validates it.
 *
 * WHY A CONTRACT TEST AND NOT SEVEN UNIT TESTS.
 *
 * A schema being CORRECT and a schema being USED are different facts, and only
 * the second one protects anything. `configUpdateSchema` and
 * `resourceAllocationSchema` were both written, both correct, and both wired to
 * nothing — a unit test of either would have passed for as long as they existed.
 *
 * Probed exactly that way: removing `validateRequest` from a route failed ZERO
 * tests before this file existed.
 *
 * So this walks the real Express router — the object `main.ts` mounts — and
 * reads the handler names out of its stack, rather than reading the source.
 * (`validateRequest` returns a NAMED function for this reason; while it was an
 * anonymous arrow, "does this route validate?" was unanswerable by any test.)
 *
 * THE ALLOW-LIST IS THE HONEST PART. Some POSTs genuinely carry no body — a
 * like or a bookmark is fully identified by its URL and the caller's session —
 * and demanding an empty schema for them would be ceremony that teaches people
 * to add entries here without thinking. Each entry states why.
 */
const NO_BODY_BY_DESIGN = new Set([
  // Identified entirely by the URL plus the authenticated user. Nothing is
  // read from the body, so there is nothing to validate.
  'POST /:id/like',
  'POST /:id/bookmark',
  'POST /:roadmapId/comments/:commentId/like',
]);

type Layer = {
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: Array<{ name?: string }>;
  };
};

function bodyRoutes(router: Router) {
  const out: Array<{ key: string; handlers: string[] }> = [];
  for (const layer of (router as unknown as { stack: Layer[] }).stack ?? []) {
    if (!layer.route) continue;
    const method = Object.keys(layer.route.methods)[0]?.toUpperCase();
    if (!['POST', 'PUT', 'PATCH'].includes(method)) continue;
    out.push({
      key: `${method} ${layer.route.path}`,
      handlers: layer.route.stack.map((h) => h.name || '<anonymous>'),
    });
  }
  return out;
}

/**
 * rbacRoutes is deliberately absent.
 *
 * Its handlers call `validateRequest(schema, req.body)` INSIDE the controller
 * rather than as middleware. That is a different pattern, not a missing check,
 * and listing it here would either produce false failures or push someone into
 * a needless refactor to satisfy a test.
 */
const SUITES: Array<{ label: string; build: () => Router }> = [
  { label: 'adminRoutes', build: () => new AdminRoutes().getRouter() },
  { label: 'roadMapRoutes', build: () => new RoadMapRoutes().getRouter() },
  { label: 'articleRoutes', build: () => new ArticleRoutes().getRouter() },
  { label: 'challengeRoutes', build: () => new ChallengeRoutes().getRouter() },
];

describe.each(SUITES)('$label validates request bodies', ({ build }) => {
  it('declares body-taking routes at all', () => {
    // Without this, an Express upgrade that changes the stack shape would make
    // every assertion below pass over an empty list.
    expect(bodyRoutes(build()).length).toBeGreaterThan(0);
  });

  it('runs validateRequest on every route that reads a body', () => {
    const missing = bodyRoutes(build())
      .filter((r) => !NO_BODY_BY_DESIGN.has(r.key))
      .filter((r) => !r.handlers.includes('validateRequest'))
      .map((r) => r.key);

    expect(missing).toEqual([]);
  });
});

describe('the allow-list itself', () => {
  it('contains only routes that still exist', () => {
    // An allow-list entry outliving its route is how an exemption quietly
    // becomes a wildcard for whatever later takes that path.
    const all = new Set(SUITES.flatMap((s) => bodyRoutes(s.build())).map((r) => r.key));
    const stale = [...NO_BODY_BY_DESIGN].filter((k) => !all.has(k));
    expect(stale).toEqual([]);
  });
});
