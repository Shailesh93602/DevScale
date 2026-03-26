'use client';

/**
 * AuthContext — Single Source of Truth for Authentication & RBAC
 *
 * Architecture:
 * - Listens to Supabase auth state changes (onAuthStateChange) for real-time session sync
 * - Fetches user profile (with role) from backend `/users/me` once per session change
 * - Stores auth state in context; does NOT trigger on every route change (eliminates blink)
 * - Role-based access helpers: `isAdmin`, `isStudent`, `hasRole`, `hasAnyRole`
 *
 * To add a new role (e.g., MODERATOR):
 * 1. Add role to `UserRole` in types/index.ts
 * 2. Use `hasRole('MODERATOR')` or `hasAnyRole(['ADMIN', 'MODERATOR'])` in components/routes
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { UserRole, type IUser } from '@/types';

// ─── Auth State ───────────────────────────────────────────────────────────────
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  /** Current auth status — use this to show loading states */
  status: AuthStatus;
  /** True while the initial auth check is in progress */
  isLoading: boolean;
  /** True once auth is confirmed (status === 'authenticated') */
  isAuthenticated: boolean;
  /** Full user profile from backend (includes role) */
  user: IUser | null;
  /** Active Supabase session */
  session: Session | null;

  // ─── RBAC Helpers ──────────────────────────────────────────────────────────
  /** Check if user has a specific role (case-insensitive) */
  hasRole: (role: UserRole) => boolean;
  /** Check if user has any of the specified roles */
  hasAnyRole: (roles: UserRole[]) => boolean;
  /** Shorthand: user is an ADMIN */
  isAdmin: boolean;
  /** Shorthand: user is a STUDENT */
  isStudent: boolean;

  // ─── Actions ───────────────────────────────────────────────────────────────
  /** Re-fetch the user profile from backend (call after profile updates) */
  refreshUser: () => Promise<void>;
  /** Sign out (clears session and user state) */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<IUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const supabase = createClient();

  /**
   * Fetch the full user profile (with role) from our backend.
   * We use a direct fetch here (not the useAxios hook) because:
   * 1. This must run outside of React render cycles
   * 2. We need to control the token manually
   */
  const fetchUserProfile = useCallback(
    async (accessToken: string): Promise<IUser | null> => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          },
        );

        if (!response.ok) {
          // 401 → session is invalid or user doesn't exist in our DB yet
          return null;
        }

        const json = await response.json();
        return json?.data ?? null;
      } catch (e) {
        console.error('[AuthContext] Failed to fetch user profile:', e);
        return null;
      }
    },
    [],
  );

  const refreshUser = useCallback(async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    if (!currentSession?.access_token) {
      setUser(null);
      setStatus('unauthenticated');
      return;
    }

    const profile = await fetchUserProfile(currentSession.access_token);
    if (profile) {
      setUser(profile);
      setStatus('authenticated');
    } else {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, [supabase, fetchUserProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setStatus('unauthenticated');
  }, [supabase]);

  // ─── Bootstrap: subscribe to Supabase auth state changes ─────────────────
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (event === 'SIGNED_OUT' || !newSession) {
        setUser(null);
        setStatus('unauthenticated');
        return;
      }

      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'INITIAL_SESSION'
      ) {
        const profile = await fetchUserProfile(newSession.access_token);
        if (!mounted) return;

        if (profile) {
          setUser(profile);
          setStatus('authenticated');
        } else {
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  // ─── RBAC Helpers ─────────────────────────────────────────────────────────
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return user?.role === role;
    },
    [user],
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      return roles.some((r) => hasRole(r));
    },
    [hasRole],
  );

  const isAdmin = user?.role === UserRole.ADMIN;
  const isStudent = user?.role === UserRole.STUDENT;

  const value = useMemo(() => ({
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user,
    session,
    hasRole,
    hasAnyRole,
    isAdmin,
    isStudent,
    refreshUser,
    signOut,
  }), [status, user, session, hasRole, hasAnyRole, isAdmin, isStudent, refreshUser, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
