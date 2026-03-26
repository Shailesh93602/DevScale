'use client';
import { ReactNode, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePathname, useRouter } from 'next/navigation';
import { persistor } from '@/lib/store';
import { PersistGate } from 'redux-persist/integration/react';
import { useAppDispatch } from '@/lib/hooks';
import {
  setUser,
  setAuthenticated,
  clearUser,
} from '@/lib/features/user/userSlice';
import Loader from '@/components/Loader';
import { useAuth } from '@/contexts/AuthContext';

export default function App({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, status, isLoading: isAuthLoading } = useAuth();

  const isPublic = path === '/' || path?.startsWith('/auth');

  // Initialize theme and mount state
  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('theme') ?? 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Sync AuthContext with Redux
  useEffect(() => {
    if (status === 'authenticated' && user) {
      dispatch(setUser({ user }));
      dispatch(setAuthenticated(true));
    } else if (status === 'unauthenticated') {
      dispatch(setAuthenticated(false));
      dispatch(clearUser());
    }
  }, [status, user, dispatch]);

  // Handle protected route redirects only after mounting to avoid hydration mismatch
  useEffect(() => {
    if (!isMounted || isAuthLoading) return;

    if (!isPublic && status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [isMounted, status, isAuthLoading, isPublic, router]);

  // Return consistent structure for hydration
  // Loader is rendered over the content instead of replacing it to avoid mismatch
  return (
    <PersistGate loading={null} persistor={persistor}>
      <div className="flex min-h-screen flex-col justify-between">
        <Navbar isPublic={isPublic} />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        {isAuthLoading && isMounted && <Loader type="SiteLoader" />}
      </div>
    </PersistGate>
  );
}

