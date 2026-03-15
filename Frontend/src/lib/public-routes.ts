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
  '/career-roadmap',
  '/coding-challenges',
  '/collaboration-opportunities',
  '/community',
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
  '/placement-preparation',
  '/profile',
  '/resources',
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
  '/blogs',
  '/contact',
  '/faq',
  '/interview-question',
] as const;

// ─── Route Check Functions ────────────────────────────────────────────────────

/** Returns true if this is a guest-only route (login, register, etc.) */
export function isGuestOnlyRoute(pathname?: string | null): boolean {
  if (!pathname) return false;
  return matchesRoutePrefix(pathname, GUEST_ONLY_ROUTE_PREFIXES);
}

/** Returns true if this route requires authentication (any role) */
export function requiresAuthRoute(pathname?: string | null): boolean {
  if (!pathname) return false;
  return matchesRoutePrefix(pathname, AUTH_REQUIRED_ROUTE_PREFIXES);
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
