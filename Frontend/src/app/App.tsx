'use client';
import { ReactNode, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux';
import { store, persistor } from '@/lib/store';

import { PersistGate } from 'redux-persist/integration/react';

export default function App({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState<boolean>(false);
  const path = usePathname();
  let isPublic = true;
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
  if (
    routes.find(
      (route) =>
        route === path || path.slice(0, path.lastIndexOf('/')) === route,
    )
  )
    isPublic = false;

  useEffect(() => {
    setIsClient(true);
    const savedTheme = localStorage.getItem('theme') ?? 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  if (!isClient) return null;

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
