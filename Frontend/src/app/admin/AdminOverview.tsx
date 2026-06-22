'use client';

import { useEffect } from 'react';
import { useAxiosGet } from '@/hooks/useAxios';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import {
  Users,
  UserCheck,
  UserPlus,
  TrendingUp,
  Map,
  Swords,
  FileText,
  HelpCircle,
  Activity,
  CalendarDays,
  CalendarRange,
  Timer,
  Database,
  Zap,
  Gauge,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';

interface DashboardMetrics {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    usersByRole: Record<string, number>;
    completionRates: Record<string, number>;
  };
  platformMetrics: {
    totalRoadmaps: number;
    totalChallenges: number;
    totalArticles: number;
    totalQuizzes: number;
    engagementRate: number;
  };
  activityMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    peakUsageTimes: string[];
  };
  systemHealth: {
    databaseStatus: string;
    cacheStatus: string;
    averageResponseTime: number;
    errorRate: number;
  };
}

const ACCENTS = {
  violet:
    'from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400',
  emerald:
    'from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400',
  sky: 'from-sky-500/15 to-sky-500/5 text-sky-600 dark:text-sky-400',
  amber: 'from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400',
  rose: 'from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400',
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = 'violet',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  accent?: keyof typeof ACCENTS;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${ACCENTS[accent]} opacity-60 blur-2xl transition-opacity group-hover:opacity-100`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
          {sub ? (
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          ) : null}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${ACCENTS[accent]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h2>
  );
}

function HealthPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        ok ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-rose-500'}`}
      />
      {label}
    </span>
  );
}

export default function AdminOverview() {
  const [getMetrics, state] = useAxiosGet<DashboardMetrics>(
    '/admin/dashboard/metrics',
  );

  useEffect(() => {
    void getMetrics();
  }, []);

  if (state.isLoading || (!state.data && !state.isError)) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (state.isError || !state.data) {
    return (
      <ErrorState
        title="Couldn't load metrics"
        message="The dashboard metrics failed to load. Please try again."
        onRetry={() => void getMetrics()}
      />
    );
  }

  const { userStats, platformMetrics, activityMetrics, systemHealth } =
    state.data;
  const dbOk = /up|ok|healthy|connected/i.test(systemHealth.databaseStatus);
  const cacheOk = /up|ok|healthy|connected/i.test(systemHealth.cacheStatus);

  return (
    <div>
      <SectionTitle>Users</SectionTitle>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={userStats.totalUsers}
          accent="violet"
        />
        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={userStats.activeUsers}
          accent="emerald"
        />
        <StatCard
          icon={UserPlus}
          label="New Users"
          value={userStats.newUsers}
          sub="recent signups"
          accent="sky"
        />
        <StatCard
          icon={TrendingUp}
          label="Engagement"
          value={`${Math.round((platformMetrics.engagementRate || 0) * (platformMetrics.engagementRate <= 1 ? 100 : 1))}%`}
          accent="amber"
        />
      </div>

      <SectionTitle>Platform Content</SectionTitle>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Map}
          label="Roadmaps"
          value={platformMetrics.totalRoadmaps}
          accent="violet"
        />
        <StatCard
          icon={Swords}
          label="Challenges"
          value={platformMetrics.totalChallenges}
          accent="rose"
        />
        <StatCard
          icon={FileText}
          label="Articles"
          value={platformMetrics.totalArticles}
          accent="sky"
        />
        <StatCard
          icon={HelpCircle}
          label="Quizzes"
          value={platformMetrics.totalQuizzes}
          accent="emerald"
        />
      </div>

      <SectionTitle>Activity</SectionTitle>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Activity}
          label="Daily Active"
          value={activityMetrics.dailyActiveUsers}
          accent="emerald"
        />
        <StatCard
          icon={CalendarDays}
          label="Weekly Active"
          value={activityMetrics.weeklyActiveUsers}
          accent="sky"
        />
        <StatCard
          icon={CalendarRange}
          label="Monthly Active"
          value={activityMetrics.monthlyActiveUsers}
          accent="violet"
        />
        <StatCard
          icon={Timer}
          label="Avg Session"
          value={`${Math.round(activityMetrics.averageSessionDuration || 0)}m`}
          accent="amber"
        />
      </div>

      <SectionTitle>System Health</SectionTitle>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Database className="h-4 w-4" /> Database
          </div>
          <HealthPill
            label={systemHealth.databaseStatus || 'unknown'}
            ok={dbOk}
          />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Zap className="h-4 w-4" /> Cache
          </div>
          <HealthPill
            label={systemHealth.cacheStatus || 'unknown'}
            ok={cacheOk}
          />
        </div>
        <StatCard
          icon={Gauge}
          label="Avg Response"
          value={`${Math.round(systemHealth.averageResponseTime || 0)}ms`}
          accent="sky"
        />
        <StatCard
          icon={AlertTriangle}
          label="Error Rate"
          value={`${((systemHealth.errorRate || 0) * (systemHealth.errorRate <= 1 ? 100 : 1)).toFixed(2)}%`}
          accent={systemHealth.errorRate > 0.05 ? 'rose' : 'emerald'}
        />
      </div>
    </div>
  );
}
