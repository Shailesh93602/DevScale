'use client';

import { RoleGuard } from '@/components/guards/RouteGuards';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ScrollText,
} from 'lucide-react';
import Link from 'next/link';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminModeration from './AdminModeration';
import AdminAudit from './AdminAudit';

export default function AdminPage() {
  const { user } = useAuth();
  const name = user?.first_name
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    : 'Administrator';

  return (
    <RoleGuard role="ADMIN">
      <div className="container mx-auto px-4 py-8 md:py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Admin Console
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Welcome back, {name}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Monitor platform health, manage users, and moderate content.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">View as student</Link>
          </Button>
        </div>

        {/* Sections */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="moderation" className="gap-2">
              <ShieldCheck className="h-4 w-4" /> Moderation
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <ScrollText className="h-4 w-4" /> Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>
          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>
          <TabsContent value="moderation">
            <AdminModeration />
          </TabsContent>
          <TabsContent value="audit">
            <AdminAudit />
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
