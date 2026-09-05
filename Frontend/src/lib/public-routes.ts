/**
 * Route Classification — Central place to define route access rules
 *
 * To add a new role's routes (e.g., MODERATOR):
 * 1. Add MODERATOR_ROUTE_PREFIXES array
 * 2. Add `requiresModeratorRoute()` function
 * 3. Use it in middleware and create a <RoleGuard role="MODERATOR"> component
 *
 * Route types:
 * - PUBLIC: Anyone can access (logged in or not)
 * - GUEST_ONLY: Only unauthenticated users (login, register pages)
 * - AUTH_REQUIRED: Any authenticated user (student, admin, moderator, etc.)
 * - ADMIN_ONLY: Only users with ADMIN role
 */

const matchesRoutePrefix = (
  pathname: string,
  routePrefixes: readonly string[],
): boolean =>
  routePrefixes.some(
    (routePrefix) =>
      pathname === routePrefix || pathname.startsWith(`${routePrefix}/`),
  );

// ─── Route Prefix Lists ───────────────────────────────────────────────────────

/** Only unauthenticated users — authenticated users get redirected to /dashboard */
export const GUEST_ONLY_ROUTE_PREFIXES = ['/auth'] as const;

/**
 * Admin-only routes — requires ADMIN role.
 * These are also included in AUTH_REQUIRED_ROUTE_PREFIXES.
 */
export const ADMIN_ROUTE_PREFIXES = ['/admin'] as const;

/**
 * Requires any authenticated user (student, admin, moderator).
 * Add new routes here as you build more features.
 */
export const AUTH_REQUIRED_ROUTE_PREFIXES = [
  '/admin', // admin-only (further checked by requiresAdminRoute)
  '/articles',
  '/battle-zone',
  // /career-roadmap and /coding-challenges moved to PUBLIC on 2026-09-03 (the
  // owner's decision: a visitor may browse roadmaps and the challenge list).
  // Solving a challenge is still gated — see AUTH_REQUIRED_ROUTE_PATTERNS.
  '/collaboration-opportunities',
  '/community',
  // /create-battle and /settings were in NEITHER list — the same gap this file
  // already documents for /moderate below, still open for two more routes.
  // /settings renders the API-key panel's shell (including the "encrypted
  // before it is stored" copy) to anonymous visitors; /create-battle renders a
  // full battle-creation form that can only ever 401. The data behind both is
  // safe — every endpoint they call is auth-gated — but a signed-out visitor
  // should not be looking at either shell, and a crawler should not index it.
  '/create-battle',
  '/create-resource',
  '/dashboard',
  '/details',
  '/discussion-forums',
  '/discussions',
  '/doubts',
  '/edit-article',
  '/events',
  '/logout',
  '/member-highlights',
  // /moderate was in NEITHER list, so `updateSession` took its fast path and
  // the page had no server-side gate at all — only a client <RoleGuard>. The
  // data behind it was safe (every backend endpoint it calls is role-gated),
  // but the shell rendered for anonymous visitors.
  //
  // AUTH_REQUIRED rather than ADMIN: the middleware's only role concept is
  // ADMIN, and moderation is open to MODERATOR too — gating it as admin-only
  // would lock out exactly the people it is for. The RoleGuard still narrows
  // it to ADMIN/MODERATOR; this stops anonymous access at the edge.
  '/moderate',
  '/placement-preparation',
  '/profile',
  '/resources',
  '/settings',
  '/streak',
  '/achievements',
  '/tech-interests-assessment',
] as const;

/**
 * Publicly accessible routes — no auth required.
 * Note: '/' is special — authenticated users get redirected to /dashboard.
 */
export const PUBLIC_ROUTE_PREFIXES = [
  '/',
  '/about',
  '/article-listing',
  // /battles/demo — a recorded two-player battle replayed from a committed
  // fixture. No socket, no account, no writes. The only route under /battles.
  '/battles',
  '/blogs',
  // Anonymous read-only view (2026-09-03): the roadmap list, each roadmap's
  // detail page, and the challenge LIST. Every write on those pages shows a
  // "Sign in to …" affordance instead of firing a request that can only 401.
  '/career-roadmap',
  '/coding-challenges',
  '/contact',
  '/faq',
  '/interview-question',
  // /pricing was in neither list. Nothing was exposed (it is marketing copy),
  // but being unclassified meant isPublicRoute() returned false, so the sitemap
  // filter dropped a page that anonymous visitors can load and that should
  // rank — the inverse of the eight gated URLs the sitemap used to advertise.
  '/pricing',
] as const;

/**
 * Auth-required routes that a PREFIX cannot express.
 *
 * `/coding-challenges` (the list) is public; `/coding-challenges/<id>` (the
 * editor, which loads the full problem and submits attempts) is not. A prefix
 * list can only say "this and everything under it", so the one exception is a
 * pattern. Checked by requiresAuthRoute alongside the prefixes, so the
 * middleware, the sitemap and robots.txt all see the same answer.
 */
export const AUTH_REQUIRED_ROUTE_PATTERNS: readonly RegExp[] = [
  /^\/coding-challenges\/[^/]+(?:\/.*)?$/,
];

// ─── Route Check Functions ────────────────────────────────────────────────────

/** Returns true if this is a guest-only route (login, register, etc.) */
export function isGuestOnlyRoute(pathname?: string | null): boolean {
  if (!pathname) return false;
  return matchesRoutePrefix(pathname, GUEST_ONLY_ROUTE_PREFIXES);
}

/** Returns true if this route requires authentication (any role) */
export function requiresAuthRoute(pathname?: string | null): boolean {
  if (!pathname) return false;
  if (matchesRoutePrefix(pathname, AUTH_REQUIRED_ROUTE_PREFIXES)) return true;
  return AUTH_REQUIRED_ROUTE_PATTERNS.some((re) => re.test(pathname));
}

/** Returns true if this route requires ADMIN role */
export function requiresAdminRoute(pathname?: string | null): boolean {
  if (!pathname) return false;
  return matchesRoutePrefix(pathname, ADMIN_ROUTE_PREFIXES);
}

/** Returns true if this is a public route */
export function isPublicRoute(pathname?: string | null): boolean {
  if (!pathname) return false;
  if (pathname === '/') return true;
  if (isGuestOnlyRoute(pathname) || requiresAuthRoute(pathname)) return false;
  return matchesRoutePrefix(pathname, PUBLIC_ROUTE_PREFIXES);
}
