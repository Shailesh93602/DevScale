'use client';

/**
 * AuthContext — Single Source of Truth for Authentication & RBAC
 *
 * Architecture:
 * - Listens to Supabase auth state changes (onAuthStateChange) for real-time session sync
 * - Fetches user profile (with role) from backend `/users/me` on each session change; if it
 *   fails, retries with backoff and on focus/online while `user` is the session fallback
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
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { createClient } from '@/utils/supabase/client';
import { clearDashboardCache } from '@/lib/dashboard-cache';
import { clearChallengeDrafts } from '@/lib/challenge-drafts';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { IUser, UserRole } from '@/types';

// ─── Auth State ───────────────────────────────────────────────────────────────
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * Where `user` came from. `fallback` means `/users/me` failed and `user` was built from
 * the Supabase session: its `id` is blank, never a `User.id`. Compare ids with `userId`.
 */
export type ProfileStatus = 'loading' | 'ready' | 'fallback' | 'none';

/** Backoff between `/users/me` retries while the profile is the fallback. */
export const PROFILE_RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 16000, 30000];

interface AuthContextValue {
  /** Current auth status — use this to show loading states */
  status: AuthStatus;
  /** True while the initial auth check is in progress */
  isLoading: boolean;
  /** True once auth is confirmed (status === 'authenticated') */
  isAuthenticated: boolean;
  /** Profile from backend (includes role), or a fallback built from the session */
  user: IUser | null;
  /** Our `User.id`, only once the backend profile has loaded; null otherwise */
  userId: string | null;
  profileStatus: ProfileStatus;
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

function buildFallbackUser(authUser: SupabaseUser): IUser {
  const email = authUser.email ?? '';
  const fullName =
    (authUser.user_metadata?.full_name as string | undefined) ?? '';
  const [firstName = '', ...rest] = fullName.split(' ');

  return {
    // Not a User.id: the Supabase id here once made id comparisons silently wrong.
    id: '',
    username: email.split('@')[0] || 'user',
    first_name: firstName,
    last_name: rest.join(' '),
    email,
    avatar_url: '',
    bio: '',
    address: '',
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    website_url: '',
    specialization: '',
    college: '',
    graduation_year: new Date().getFullYear(),
    skills: [],
    experience_level: '',
    role: null,
  };
}

/**
 * Fetch the full user profile (with role) from our backend. A plain fetch, not the
 * axios hook: it runs outside render and controls the token itself.
 */
async function fetchUserProfile(accessToken: string): Promise<IUser | null> {
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
    if (!response.ok) return null;
    const json = await response.json();
    return json?.data ?? null;
  } catch (e) {
    console.error('[AuthContext] Failed to fetch user profile:', e);
    return null;
  }
}

function ProfileNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex max-w-sm items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm"
    >
      <span>
        We couldn&apos;t load your profile yet. Some features may not work until
        it does.
      </span>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 font-medium text-foreground underline underline-offset-2"
      >
        Retry
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<IUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('loading');
  const [profileFailures, setProfileFailures] = useState(0);

  // One client per provider: the effects below must not resubscribe (and drop a pending
  // retry) on every render.
  const [supabase] = useState(createClient);

  // Mirrors for callbacks that outlive a render (timers, window listeners).
  const profileStatusRef = useRef<ProfileStatus>('loading');
  /** Supabase id the loaded profile belongs to. */
  const profileOwnerRef = useRef<string | null>(null);
  /** Bumped by every load and by sign-out, so a stale response is dropped. */
  const generationRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryAttemptRef = useRef(0);
  const mountedRef = useRef(true);

  const setProfile = useCallback((next: ProfileStatus) => {
    profileStatusRef.current = next;
    setProfileStatus(next);
  }, []);

  const clearRetry = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryTimerRef.current = null;
  }, []);

  const resetProfile = useCallback(() => {
    generationRef.current++;
    clearRetry();
    retryAttemptRef.current = 0;
    profileOwnerRef.current = null;
    setProfileFailures(0);
    setProfile('none');
  }, [clearRetry, setProfile]);

  // Declared before use through a ref: loadProfile schedules retryNow, which calls loadProfile.
  const retryNowRef = useRef<() => Promise<void>>(async () => {});

  const loadProfile = useCallback(
    async (accessToken: string, authUser: SupabaseUser) => {
      const generation = ++generationRef.current;
      clearRetry();
      const profile = await fetchUserProfile(accessToken);
      if (!mountedRef.current || generation !== generationRef.current) return;

      if (profile) {
        retryAttemptRef.current = 0;
        profileOwnerRef.current = authUser.id;
        setProfileFailures(0);
        setUser(profile);
        setProfile('ready');
        setStatus('authenticated');
        return;
      }

      // A failed refresh keeps a profile already loaded for this same account.
      if (
        profileStatusRef.current === 'ready' &&
        profileOwnerRef.current === authUser.id
      ) {
        return;
      }
      // Stay authenticated on a valid session even when the profile API is unavailable.
      profileOwnerRef.current = null;
      setUser(buildFallbackUser(authUser));
      setProfile('fallback');
      setStatus('authenticated');
      setProfileFailures((n) => n + 1);

      const delay = PROFILE_RETRY_DELAYS_MS[retryAttemptRef.current];
      if (delay !== undefined) {
        retryAttemptRef.current++;
        retryTimerRef.current = setTimeout(() => {
          void retryNowRef.current();
        }, delay);
      }
    },
    [clearRetry, setProfile],
  );

  const retryNow = useCallback(async () => {
    const {
      data: { session: current },
    } = await supabase.auth.getSession();
    if (!mountedRef.current || !current?.access_token) return;
    await loadProfile(current.access_token, current.user);
  }, [supabase, loadProfile]);
  useEffect(() => {
    retryNowRef.current = retryNow;
  }, [retryNow]);

  const refreshUser = useCallback(async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    if (currentSession?.access_token) {
      await loadProfile(currentSession.access_token, currentSession.user);
      return;
    }

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    resetProfile();
    if (authUser) {
      setUser(buildFallbackUser(authUser));
      setProfile('fallback');
      setStatus('authenticated');
    } else {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, [supabase, loadProfile, resetProfile, setProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    clearDashboardCache();
    clearChallengeDrafts();
    resetProfile();
    setUser(null);
    setSession(null);
    setStatus('unauthenticated');
  }, [supabase, resetProfile]);

  // ─── Bootstrap: subscribe to Supabase auth state changes ─────────────────
  useEffect(() => {
    mountedRef.current = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mountedRef.current) return;

      setSession(newSession);

      if (event === 'SIGNED_OUT') {
        clearDashboardCache();
        clearChallengeDrafts();
        resetProfile();
        setUser(null);
        setStatus('unauthenticated');
        return;
      }

      if (!newSession) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!mountedRef.current) return;

        resetProfile();
        if (authUser) {
          setUser(buildFallbackUser(authUser));
          setProfile('fallback');
          setStatus('authenticated');
        } else {
          setUser(null);
          setStatus('unauthenticated');
        }
        return;
      }

      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'INITIAL_SESSION'
      ) {
        await loadProfile(newSession.access_token, newSession.user);
      }
    });

    return () => {
      mountedRef.current = false;
      clearRetry();
      subscription.unsubscribe();
    };
  }, [supabase, loadProfile, resetProfile, clearRetry, setProfile]);

  // While the profile is the fallback, coming back to the tab or the network retries now.
  useEffect(() => {
    const retryIfFallback = () => {
      if (profileStatusRef.current !== 'fallback') return;
      retryAttemptRef.current = 0;
      void retryNowRef.current();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') retryIfFallback();
    };
    window.addEventListener('focus', retryIfFallback);
    window.addEventListener('online', retryIfFallback);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', retryIfFallback);
      window.removeEventListener('online', retryIfFallback);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const retryFromNotice = useCallback(() => {
    retryAttemptRef.current = 0;
    void retryNowRef.current();
  }, []);

  // ─── RBAC Helpers ─────────────────────────────────────────────────────────
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      if (!user?.role?.name) return false;
      return user.role.name.toUpperCase() === role.toUpperCase();
    },
    [user],
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      return roles.some((r) => hasRole(r));
    },
    [hasRole],
  );

  const isAdmin = hasRole('ADMIN');
  const isStudent = hasRole('STUDENT');

  const value: AuthContextValue = {
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user,
    userId: profileStatus === 'ready' && user?.id ? user.id : null,
    profileStatus,
    session,
    hasRole,
    hasAnyRole,
    isAdmin,
    isStudent,
    refreshUser,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Quiet: one failure on a cold first visit usually clears on the first retry. */}
      {profileStatus === 'fallback' && profileFailures >= 2 && (
        <ProfileNotice onRetry={retryFromNotice} />
      )}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
