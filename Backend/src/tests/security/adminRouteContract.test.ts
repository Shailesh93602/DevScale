import { describe, it, expect } from '@jest/globals';
import type { Router } from 'express';

import { AdminRoutes } from '../../routes/adminRoutes';
import { ChallengeRoutes } from '../../routes/challengeRoutes';
import { RoadMapRoutes } from '../../routes/roadMapRoutes';
import { RBACRoutes } from '../../routes/rbacRoutes';

/**
 * Every admin route is authenticated AND role-gated.
 *
 * WHY THIS IS A CONTRACT TEST AND NOT AN E2E TEST.
 *
 * The failure being prevented is not "the guard is broken" — it is "someone
 * added a route and forgot the guard". That is a per-route property, so the
 * test has to enumerate the routes rather than exercise a few of them. An E2E
 * suite proves the routes it happens to visit are safe and says nothing about
 * the eighth one added next month, which is exactly the one that gets missed.
 *
 * It also needs no database, no server and no credentials, so it runs on every
 * commit rather than only where an environment exists.
 *
 * WHY IT INSPECTS THE REAL ROUTER.
 *
 * `getRouter()` returns the object Express actually mounts. Asserting against a
 * hand-maintained list of "routes that should be protected" would pass happily
 * while the real router disagreed — the same failure that once left `/admin`
 * publicly reachable behind a green test in this workspace.
 */

interface Layer {
  name?: string;
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: Array<{ name?: string }>;
  };
  handle?: { stack?: Layer[] };
}

/** Middleware applied to the whole router via `router.use(...)`. */
function routerLevelMiddleware(router: Router): string[] {
  return ((router as unknown as { stack: Layer[] }).stack ?? [])
    .filter((layer) => !layer.route)
    .map((layer) => layer.name ?? '<anonymous>');
}

/** Every declared route, with the middleware chain attached to it. */
function routes(
  router: Router
): Array<{ method: string; path: string; handlers: string[] }> {
  const out: Array<{ method: string; path: string; handlers: string[] }> = [];
  for (const layer of (router as unknown as { stack: Layer[] }).stack ?? []) {
    if (!layer.route) continue;
    for (const method of Object.keys(layer.route.methods)) {
      out.push({
        method: method.toUpperCase(),
        path: layer.route.path,
        handlers: layer.route.stack.map((h) => h.name ?? '<anonymous>'),
      });
    }
  }
  return out;
}

/**
 * A route is guarded if the protection is on the route itself OR applied to the
 * whole router. Both are legitimate; only "neither" is a bug.
 */
function isGuarded(
  handlers: string[],
  routerMiddleware: string[],
  name: string
): boolean {
  return handlers.includes(name) || routerMiddleware.includes(name);
}

/**
 * Routes that are authenticated but deliberately NOT role-gated.
 *
 * An exemption list, not a loosened rule. Each entry names the route and why,
 * so adding one is a decision somebody has to write down rather than a check
 * quietly getting weaker. A blanket rule with no escape hatch gets deleted the
 * first time it is inconvenient, which is worse than one with a short list.
 *
 * `GET /check-permission` is used by the UI to decide what to render for the
 * CURRENT user, so every signed-in user needs it. The handler enforces that a
 * non-admin may only ask about their own id — which it did NOT do until this
 * test surfaced the route: `userId` came from the query string, so any user
 * could map the authorisation model account by account.
 */
const UNGATED_BY_DESIGN = new Set(['GET /check-permission']);

const SUITES: Array<{ label: string; build: () => Router }> = [
  { label: 'adminRoutes', build: () => new AdminRoutes().getRouter() },
  { label: 'rbacRoutes', build: () => new RBACRoutes().getRouter() },
];

/**
 * Content routers, checked for their MUTATIONS only.
 *
 * These are not admin routers — their GETs are public content and must stay
 * open. But creating or editing a challenge or a roadmap is privileged, and
 * every one of those guards was found **commented out**:
 *
 *     this.router.post('/',
 *       // authorizeRoles('admin', 'instructor'),
 *       ...
 *
 * `authMiddleware` runs at the router level, so they were authenticated but not
 * authorised. Any signed-in student could create a challenge, or PATCH one —
 * and a challenge body includes its test cases, so that is editing the expected
 * outputs of a problem other people are graded against.
 *
 * The original guards named `'instructor'`, a role that has never existed
 * (seeded roles are ADMIN, MODERATOR, STUDENT), so restoring them verbatim
 * would have implied a role model the app does not have.
 *
 * Splitting reads from writes is the point: a blanket "every route is gated"
 * rule is wrong here and would have to be exempted away, which is how a rule
 * stops being enforced.
 */
const CONTENT_SUITES: Array<{ label: string; build: () => Router }> = [
  { label: 'challengeRoutes', build: () => new ChallengeRoutes().getRouter() },
  { label: 'roadMapRoutes', build: () => new RoadMapRoutes().getRouter() },
];

/**
 * Acting on your OWN account is not privileged — it is the point of the app.
 *
 * Submitting a solution, liking, bookmarking, enrolling: all of these write,
 * and all of them write something that belongs to the caller. Requiring a role
 * for them would break the product.
 *
 * The list is explicit rather than pattern-matched so that adding one is a
 * decision somebody writes down. "It looked self-service" is how a genuinely
 * privileged mutation slips through.
 */
const SELF_SERVICE = new Set([
  'POST /:challengeId/submit',
  'POST /:id/like',
  'POST /:id/bookmark',
  'POST /enroll',
  'POST /:id/comments',
  'POST /:roadmapId/comments/:commentId/like',
  'POST /:id/enroll',
  'POST /:id/progress',
]);

describe.each(SUITES)('$label', ({ build }) => {
  const router = build();
  const routerMiddleware = routerLevelMiddleware(router);
  const declared = routes(router);

  it('declares routes at all', () => {
    // Load-bearing. If the introspection ever stops finding routes — an Express
    // upgrade changing the stack shape, say — every assertion below passes
    // vacuously by iterating an empty list, and a security check that silently
    // stops checking is worse than none because it is trusted.
    expect(declared.length).toBeGreaterThan(0);
  });

  it('requires authentication on every route', () => {
    const unauthenticated = declared
      .filter((r) => !isGuarded(r.handlers, routerMiddleware, 'authMiddleware'))
      .map((r) => `${r.method} ${r.path}`);

    expect(unauthenticated).toEqual([]);
  });

  it('requires a role check on every route', () => {
    // Authentication alone is not enough here: every student is authenticated.
    const ungated = declared
      .filter(
        (r) =>
          !isGuarded(r.handlers, routerMiddleware, 'authorizeRolesMiddleware')
      )
      .map((r) => `${r.method} ${r.path}`)
      .filter((r) => !UNGATED_BY_DESIGN.has(r));

    expect(ungated).toEqual([]);
  });

  it('gates reads too, not only mutations', () => {
    // GET /admin/users returns the whole user directory and GET /admin/audit/logs
    // returns who did what. A read-only admin endpoint is still an admin
    // endpoint, and "it doesn't change anything" is how they get left open.
    const reads = declared.filter((r) => r.method === 'GET');
    expect(reads.length).toBeGreaterThan(0);

    const ungatedReads = reads
      .filter(
        (r) =>
          !isGuarded(r.handlers, routerMiddleware, 'authorizeRolesMiddleware')
      )
      .map((r) => `GET ${r.path}`)
      .filter((r) => !UNGATED_BY_DESIGN.has(r));

    expect(ungatedReads).toEqual([]);
  });
});

describe.each(CONTENT_SUITES)('$label — mutations', ({ build }) => {
  const router = build();
  const routerMiddleware = routerLevelMiddleware(router);
  const declared = routes(router);

  it('declares mutating routes at all', () => {
    // Load-bearing: if introspection stops finding POST/PATCH/DELETE, the
    // assertion below passes by iterating nothing.
    const mutations = declared.filter((r) => r.method !== 'GET');
    expect(mutations.length).toBeGreaterThan(0);
  });

  it('role-gates every mutation that is not self-service', () => {
    const ungated = declared
      .filter((r) => r.method !== 'GET')
      .filter(
        (r) =>
          !isGuarded(r.handlers, routerMiddleware, 'authorizeRolesMiddleware')
      )
      .map((r) => `${r.method} ${r.path}`)
      .filter((r) => !SELF_SERVICE.has(r));

    expect(ungated).toEqual([]);
  });

  it('authenticates every mutation, even the self-service ones', () => {
    // MUTATIONS only, deliberately. Unlike the admin routers, these have
    // genuinely public reads — `GET /` lists roadmaps for signed-out visitors
    // on purpose ("Public routes — no auth required for listing"), and the
    // controller reads `req.user?.id` optionally to handle that.
    //
    // My first version asserted authentication on EVERY route here and flagged
    // that public listing. The rule was wrong, not the code. Writing something
    // still requires knowing who is writing it.
    const unauthenticated = declared
      .filter((r) => r.method !== 'GET')
      .filter((r) => !isGuarded(r.handlers, routerMiddleware, 'authMiddleware'))
      .map((r) => `${r.method} ${r.path}`);

    expect(unauthenticated).toEqual([]);
  });
});
