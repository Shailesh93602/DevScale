'use client';

/**
 * Route Guards — Client-side RBAC protection components
 *
 * Usage:
 *   <AuthGuard>              → requires any authenticated user
 *   <RoleGuard role="ADMIN"> → requires ADMIN role
 *   <RoleGuard roles={['ADMIN', 'MODERATOR']}> → requires any of the roles
 *
 * These are CLIENT-SIDE guards. The middleware provides SERVER-SIDE protection.
 * Always use both layers for maximum security.
 */

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/Loader';
import type { UserRole } from '@/types';

// ─── Auth Guard ───────────────────────────────────────────────────────────────
interface AuthGuardProps {
  children: ReactNode;
  /** Where to redirect on auth failure. Defaults to /auth/login */
  redirectTo?: string;
  /** Shown while checking auth. Defaults to full-page loader */
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  redirectTo = '/auth/login',
  fallback,
}: AuthGuardProps) {
  const { status, isAuthenticated, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(redirectTo);
    }
  }, [status, router, redirectTo]);

  // Already confirmed authenticated — render children.
  if (isAuthenticated) return <>{children}</>;

  // Session exists (Supabase cookie confirmed it) but user profile (/me) is still loading.
  // Render children immediately so the page can start fetching its own data in parallel,
  // instead of blocking for the full /me round-trip (which can take 4+ s on cold start).
  if (session !== null && status === 'loading') return <>{children}</>;

  // Show fallback/loader while waiting for session OR while awaiting the redirect.
  return fallback ? <>{fallback}</> : <Loader type="SiteLoader" />;
}

// ─── Role Guard ───────────────────────────────────────────────────────────────
interface RoleGuardProps {
  children: ReactNode;
  /** Single role required */
  role?: UserRole;
  /** Any of these roles are allowed */
  roles?: UserRole[];
  /** Where to redirect if role check fails. Defaults to /dashboard */
  redirectTo?: string;
  /** Shown while checking auth */
  fallback?: ReactNode;
  /** Show this if user doesn't have required role (instead of redirecting) */
  accessDenied?: ReactNode;
}

export function RoleGuard({
  children,
  role,
  roles,
  redirectTo = '/dashboard',
  fallback,
  accessDenied,
}: RoleGuardProps) {
  const { status, isAuthenticated, hasAnyRole, user } = useAuth();
  const router = useRouter();

  const allowedRoles = roles ?? (role ? [role] : []);

  // The role is only "resolved" once the real profile (with a role) has loaded.
  // On a full page-load of a guarded route, the session can be authenticated for
  // a moment before /users/me returns — during which `user` is a roleless
  // fallback. We must NOT decide access (or redirect) until the role is known,
  // otherwise a real admin gets bounced off /admin on a direct load.
  const roleResolved = !!user?.role?.name;
  const awaitingRole =
    status === 'authenticated' && allowedRoles.length > 0 && !roleResolved;

  const hasAccess =
    isAuthenticated && (allowedRoles.length === 0 || hasAnyRole(allowedRoles));

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
      return;
    }

    // Only redirect once we actually know the role and access is denied.
    if (status === 'authenticated' && !awaitingRole && !hasAccess && !accessDenied) {
      router.replace(redirectTo);
    }
  }, [status, awaitingRole, hasAccess, router, redirectTo, accessDenied]);

  if (
    status === 'loading' ||
    awaitingRole ||
    (!isAuthenticated && !accessDenied) ||
    (status === 'authenticated' && !hasAccess && !accessDenied)
  ) {
    // Show fallback/loader during loading, while the role resolves, AND while
    // awaiting redirect. Previously returning null caused a brief blank flash.
    return fallback ? <>{fallback}</> : <Loader type="SiteLoader" />;
  }

  if (!isAuthenticated || !hasAccess) {
    if (accessDenied) return <>{accessDenied}</>;
    return fallback ? <>{fallback}</> : <Loader type="SiteLoader" />;
  }

  return <>{children}</>;
}

// ─── Guest Guard ─────────────────────────────────────────────────────────────
/** Redirects authenticated users away from guest-only pages (login, register) */
interface GuestGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function GuestGuard({
  children,
  redirectTo = '/dashboard',
}: GuestGuardProps) {
  const { status, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(redirectTo);
    }
  }, [status, isAuthenticated, router, redirectTo]);

  if (status === 'loading' || isAuthenticated) {
    // Show loader while checking auth AND while awaiting redirect to dashboard.
    // Avoids a flash of the login form after a successful login.
    return <Loader type="SiteLoader" />;
  }

  return <>{children}</>;
}
