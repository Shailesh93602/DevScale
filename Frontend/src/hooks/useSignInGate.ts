'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

/**
 * "Sign in to …" instead of a 401.
 *
 * The roadmap and challenge pages render for visitors now, and every write
 * on them (like, bookmark, enrol, comment) used to fire a request that could
 * only fail. This hook is the one place that turns such an action into a
 * trip to the login page — with a callbackUrl back to where the visitor was,
 * and a toast that says why — so the pages do not each grow their own copy.
 *
 * `requireSignIn(verb)` returns true when the caller may proceed. It is
 * written as a guard clause on purpose: `if (!requireSignIn('like')) return;`
 * reads at the call site as exactly what it does.
 */
export function useSignInGate() {
  const { isAuthenticated, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requireSignIn = useCallback(
    (verb: string): boolean => {
      // While auth is still resolving, let the action through: the request
      // carries whatever token exists, and a genuine 401 is still handled by
      // the axios interceptor as before. Blocking here would make a member's
      // first click after a hard reload silently do nothing.
      if (status === 'loading' || isAuthenticated) return true;

      toast.info(`Sign in to ${verb}.`, { toastId: `sign-in-to-${verb}` });
      const callbackUrl = encodeURIComponent(pathname || '/');
      router.push(`/auth/login?callbackUrl=${callbackUrl}`);
      return false;
    },
    [isAuthenticated, status, router, pathname],
  );

  return { requireSignIn, isAuthenticated };
}
