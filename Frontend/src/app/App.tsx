'use client';

/**
 * App.tsx — Root Application Shell
 *
 * Responsibilities:
 * - Renders Navbar, Footer, and page content
 * - Syncs auth user into Redux (for components that still read from Redux)
 * - Does NOT perform auth checks here — that's AuthContext's job
 * - Does NOT redirect — that's the middleware + RouteGuards' job
 *
 * The blink was caused by:
 * 1. `isLoading` returning <Loader> on EVERY route change (the API was called on each path change)
 * 2. Redirecting to '/' after login, then middleware redirecting to /dashboard (double-redirect)
 * This is now fixed by using AuthContext which only fetches once per session.
 */

import { ReactNode, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAppDispatch } from '@/lib/hooks';
import {
  setUser,
  setAuthenticated,
  clearUser,
} from '@/lib/features/user/userSlice';
import { useAuth } from '@/contexts/AuthContext';

function AuthSyncToRedux() {
  const { user, isAuthenticated, status } = useAuth();
  const dispatch = useAppDispatch();

  /**
   * Sync AuthContext → Redux so that existing components using Redux
   * selectors continue to work without any changes.
   * Only runs when auth status actually changes.
   */
  useEffect(() => {
    if (status === 'loading') return;

    if (isAuthenticated && user) {
      dispatch(setUser({ user }));
      dispatch(setAuthenticated(true));
    } else {
      dispatch(clearUser());
      dispatch(setAuthenticated(false));
    }
  }, [status, isAuthenticated, user, dispatch]);

  return null; // render nothing — this is just a sync component
}

export default function App({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Sync auth state into Redux (backward compat) */}
      <AuthSyncToRedux />

    <div className="flex min-h-screen flex-col justify-between">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-grow pt-[60px] outline-none" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
    </>
  );
}
