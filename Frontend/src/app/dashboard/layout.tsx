import { Metadata } from 'next';
import { ReactNode } from 'react';
import { AuthGuard } from '@/components/guards/RouteGuards';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your learning progress and recommended roadmaps',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AuthGuard fallback={<DashboardSkeleton />}>{children}</AuthGuard>;
}
