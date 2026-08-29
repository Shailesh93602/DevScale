import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  isGuestOnlyRoute,
  requiresAuthRoute,
  requiresAdminRoute,
} from '@/lib/public-routes';

/**
 * Middleware — Server-side auth & RBAC guard
 *
 * Flow:
 * 1. Fast-path: purely public routes (not /, not auth-required, not guest-only)
 *    skip the Supabase network call entirely → no timeout risk.
 * 2. For all other routes, refresh Supabase session via getUser().
 * 3. If user is NOT authenticated:
 *    - Allow public routes through
 *    - Redirect protected routes to /auth/login
 * 4. If user IS authenticated:
 *    - Redirect from auth pages (login/register) to /dashboard
 *    - For admin routes: read role from JWT custom claims
 *    - Allow everything else through
 *
 * Admin gating reads `app_metadata.role`, which only a service-role key can
 * write. It is kept in sync by the BACKEND, in
 * `Backend/src/services/supabaseAdmin.ts`, on every role change — there is no
 * Supabase edge function involved. (An earlier version of this note pointed at
 * `supabase/functions/set-role-claim`, which has never existed in this repo.)
 *
 * To bootstrap the first admin, or to repair a stale claim:
 *
 *     cd Backend && tsx src/scripts/grant-admin.ts <username-or-email> ADMIN
 *
 * That writes the DB role and the app_metadata claim together. It needs
 * SUPABASE_SECRET_KEY (or the older SUPABASE_SERVICE_ROLE_KEY).
 *
 * There is deliberately NO fallback when the claim is absent. See the admin
 * block below for why the previous one was a privilege escalation.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;

  // ── Fast path: skip network call for purely public routes ──────────────────
  // Routes that are not /, not auth-required, and not guest-only never need
  // a user object — they're always public regardless of auth state.
  // Skipping getUser() here prevents MIDDLEWARE_INVOCATION_TIMEOUT when the
  // Supabase project is cold or free-tier paused.
  if (
    pathname !== '/' &&
    !requiresAuthRoute(pathname) &&
    !isGuestOnlyRoute(pathname)
  ) {
    return supabaseResponse;
  }
  // ──────────────────────────────────────────────────────────────────────────

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ─── CRITICAL: Do NOT add any code between createServerClient and getUser ──
  // This call refreshes the session and prevents random logouts.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // ─────────────────────────────────────────────────────────────────────────────

  // ── Unauthenticated user ───────────────────────────────────────────────────
  if (!user) {
    if (requiresAuthRoute(pathname)) {
      // Save the attempted URL so we can redirect back after login
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Public route — allow through
    return supabaseResponse;
  }

  // ── Authenticated user ─────────────────────────────────────────────────────

  // Prevent authenticated users from seeing auth pages
  if (isGuestOnlyRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Redirect root to dashboard for authenticated users
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // ── Admin route protection ─────────────────────────────────────────────────
  if (requiresAdminRoute(pathname)) {
    // 🔴 `app_metadata` ONLY. Never `user_metadata`.
    //
    // This previously read:
    //
    //     user.app_metadata?.role || user.user_metadata?.role
    //
    // which is a privilege escalation. The two are not interchangeable, and
    // supabase-js's own type docs say so: `app_metadata` is annotated "Only a
    // service role can modify", while the `data` field of the CLIENT-callable
    // `updateUser()` maps straight to `auth.users.raw_user_meta_data` — the
    // column surfaced as `user_metadata`. So any signed-in user could run
    //
    //     await supabase.auth.updateUser({ data: { role: "ADMIN" } })
    //
    // from the browser, with the publishable key, and satisfy this gate.
    //
    // It was worse than a redundant fallback: with `app_metadata.role` unset
    // the `||` was the ONLY branch that ever matched, so the attacker-writable
    // field was doing all of the work.
    //
    // The other two layers did still hold — the client RoleGuard reads the role
    // from the backend's /users/me, and every admin API route enforces
    // authorizeRoles('ADMIN') — so no data was exposed. What failed is the
    // layer this file's own header calls "Server-side auth & RBAC guard".
    const isAdmin =
      typeof user.app_metadata?.role === 'string' &&
      user.app_metadata.role.toUpperCase() === 'ADMIN';

    if (!isAdmin) {
      // Fails CLOSED. If the claim is missing the answer is "no", including
      // for a real admin whose role has not been synced — that is a
      // configuration problem to fix loudly (Backend: `tsx
      // src/scripts/grant-admin.ts <you> ADMIN`, which writes the DB role AND
      // the app_metadata claim), not a reason to trust a weaker field.
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(url);
    }
  }

  // All good — let the request through with refreshed session cookies
  return supabaseResponse;
}
