'use client';

import { RoleGuard } from '@/components/guards/RouteGuards';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <RoleGuard role="ADMIN">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back,{' '}
              {user?.first_name
                ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
                : 'Administrator'}
              . Manage your platform here.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard">View as Student</Link>
            </Button>
            <Button>Settings</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">User Management</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              View and manage all registered EduScale users.
            </p>
            <Button variant="secondary" className="w-full">
              Manage Users
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">Content Moderation</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Review articles, roadmaps, and community posts.
            </p>
            <Button variant="secondary" className="w-full">
              Review Content
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">Platform Statistics</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              View engagement metrics and growth analytics.
            </p>
            <Button variant="secondary" className="w-full">
              View Analytics
            </Button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
