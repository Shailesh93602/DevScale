'use client';
import { ReactNode, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePathname, useRouter } from 'next/navigation';
import { Provider } from 'react-redux';
import { store, persistor } from '@/lib/store';
import { PersistGate } from 'redux-persist/integration/react';
import { useAppDispatch } from '@/lib/hooks';
import {
  setUser,
  setAuthenticated,
  clearUser,
} from '@/lib/features/user/userSlice';
import { useAxiosGet } from '@/hooks/useAxios';
import { IUser } from '@/types';
import Loader from '@/components/Loader';

export default function App({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState<boolean>(false);
  const path = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [getUserApi, { data, isLoading }] = useAxiosGet<{ user: IUser }>(
    '/users/me',
  );

  const routes = [
    '/dashboard',
    '/profile',
    '/resources',
    '/coding-challenges',
    '/career-roadmap',
    '/placement-preparation',
    '/community',
    '/achievements',
    '/battle-zone',
  ];

  const isPublic = !routes.some(
    (route) => route === path || path.startsWith(route + '/'),
  );

  useEffect(() => {
    setIsClient(true);
    const savedTheme = localStorage.getItem('theme') ?? 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const validateUser = async () => {
      try {
        await getUserApi();
      } catch (error) {
        console.error('Authentication error:', error);
        dispatch(setAuthenticated(false));
        dispatch(clearUser());
        if (!isPublic) router.push('/details');
      }
    };

    validateUser();
  }, [isClient, dispatch, router, isPublic, path]);

  useEffect(() => {
    if (data) {
      if (data.user) {
        dispatch(setUser({ user: data.user }));
        dispatch(setAuthenticated(true));
      } else {
        dispatch(setAuthenticated(false));
        dispatch(clearUser());
      }
    }
  }, [data]);

  if (!isClient) return null;

  if (isLoading) return <Loader type="SiteLoader" />;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="flex min-h-screen flex-col justify-between">
          <Navbar isPublic={isPublic} />
          {children}
          <Footer />
        </div>
      </PersistGate>
    </Provider>
  );
}
