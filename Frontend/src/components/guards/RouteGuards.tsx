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
  const { status, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(redirectTo);
    }
  }, [status, isAuthenticated, router, redirectTo]);

  if (status === 'loading' || !isAuthenticated) {
    // Show fallback/skeleton while loading OR while awaiting the redirect to login.
    // Previously returning null here caused the visible blank screen between the
    // redirect trigger (useEffect) and the actual navigation completing.
    return fallback ? <>{fallback}</> : <Loader type="SiteLoader" />;
  }

  return <>{children}</>;
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
  const { status, isAuthenticated, hasAnyRole } = useAuth();
  const router = useRouter();

  const allowedRoles = roles ?? (role ? [role] : []);

  const hasAccess =
    isAuthenticated && (allowedRoles.length === 0 || hasAnyRole(allowedRoles));

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
      return;
    }

    if (status === 'authenticated' && !hasAccess && !accessDenied) {
      router.replace(redirectTo);
    }
  }, [status, hasAccess, router, redirectTo, accessDenied]);

  if (
    status === 'loading' ||
    (!isAuthenticated && !accessDenied) ||
    (status === 'authenticated' && !hasAccess && !accessDenied)
  ) {
    // Show fallback/loader during loading AND while awaiting redirect.
    // Previously returning null caused a brief blank-screen flash.
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
