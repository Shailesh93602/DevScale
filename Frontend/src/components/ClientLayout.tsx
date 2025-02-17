'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.user);
  const detailsComplete = user?.detailsComplete;

  useEffect(() => {
    if (user && !detailsComplete && pathname !== '/details') {
      router.replace('/details');
    }
    if (user && detailsComplete && pathname === '/details') {
      router.replace('/dashboard');
    }
  }, [user, detailsComplete, pathname, router]);

  return <>{children}</>;
}
