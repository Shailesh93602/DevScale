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
 * 1. Refresh Supabase session (CRITICAL — must be first)
 * 2. If user is NOT authenticated:
 *    - Allow public routes through
 *    - Redirect protected routes to /auth/login
 * 3. If user IS authenticated:
 *    - Redirect from auth pages (login/register) to /dashboard
 *    - For admin routes: read role from JWT custom claims
 *    - Allow everything else through
 *
 * Note: Admin role check in middleware uses JWT custom claims.
 * For this to work, Supabase must be configured to include the role
 * in the JWT via a custom claim. See: supabase/functions/set-role-claim
 *
 * If JWT custom claims are not set up yet, admin protection falls back
 * to the client-side RoleGuard component (still secure because the
 * server API also validates roles via authMiddleware + rbacMiddleware).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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

  const pathname = request.nextUrl.pathname;

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
    // Read role from Supabase JWT custom claims
    // app_metadata.role is set by your backend/Supabase function when the user's role changes
    const userRole =
      (user.app_metadata?.role as string) ||
      (user.user_metadata?.role as string);

    const isAdmin = userRole?.toUpperCase() === 'ADMIN';

    if (!isAdmin) {
      // Not an admin — redirect to dashboard with a denied message
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(url);
    }
  }

  // All good — let the request through with refreshed session cookies
  return supabaseResponse;
}
