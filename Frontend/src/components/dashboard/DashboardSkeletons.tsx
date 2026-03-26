'use client';
import React from 'react';
import { motion } from 'framer-motion';

const Sk = ({ className }: { className: string }) => (
  <div className={`skeleton rounded-lg ${className}`} />
);

export const StatCardSkeleton: React.FC = () => (
  <div
    className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5"
    style={{ boxShadow: 'var(--shadow-md)', minHeight: '108px' }}
  >
    <div className="flex items-start justify-between">
      <Sk className="h-3 w-24" />
      <Sk className="h-9 w-9 !rounded-xl" />
    </div>
    <div className="mt-3">
      <Sk className="h-7 w-28" />
      <Sk className="mt-2 h-3 w-20" />
    </div>
  </div>
);

export const AchievementSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 rounded-xl p-3">
    <Sk className="h-9 w-9 shrink-0 !rounded-xl" />
    <div className="flex-1 space-y-2">
      <Sk className="h-3.5 w-1/2" />
      <Sk className="h-3 w-3/4" />
    </div>
  </div>
);

export const ActivitySkeleton: React.FC = () => (
  <div className="flex items-start gap-3 border-b border-border py-3 last:border-0">
    <Sk className="mt-0.5 h-8 w-8 shrink-0 !rounded-full" />
    <div className="flex-1 space-y-2">
      <Sk className="h-3.5 w-3/4" />
      <Sk className="h-3 w-1/4" />
    </div>
  </div>
);

export const EnrolledRoadmapSkeleton: React.FC = () => (
  <div
    className="overflow-hidden rounded-xl border border-border bg-card"
    style={{ boxShadow: 'var(--shadow-sm)' }}
  >
    <Sk className="h-32 !rounded-none" />
    <div className="space-y-3 p-4">
      <Sk className="h-4 w-3/4" />
      <Sk className="h-3 w-1/4" />
      <Sk className="h-2 w-full" />
    </div>
  </div>
);

export const RecommendedRoadmapSkeleton: React.FC = () => (
  <div
    className="overflow-hidden rounded-xl border border-border bg-card"
    style={{ boxShadow: 'var(--shadow-sm)' }}
  >
    <Sk className="h-36 !rounded-none" />
    <div className="space-y-3 p-4">
      <Sk className="h-4 w-3/4" />
      <Sk className="h-3 w-1/2" />
      <Sk className="h-3 w-full" />
    </div>
  </div>
);

export const StreakCalendarSkeleton: React.FC = () => (
  <div className="grid grid-cols-7 gap-1.5">
    {Array(7)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <Sk className="h-2 w-6" />
          <Sk className="h-7 w-7 !rounded-lg" />
        </div>
      ))}
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 md:px-8">
    <motion.div
      initial={{ opacity: 0.1, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-1 gap-5 lg:grid-cols-3"
    >
      {/* Header */}
      <div className="mb-2 space-y-2 lg:col-span-3">
        <Sk className="h-6 w-32" />
        <Sk className="h-3.5 w-64" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:col-span-3 xl:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
      </div>

      {/* Main Column */}
      <div className="space-y-5 lg:col-span-2">
        <div
          className="rounded-2xl border border-border bg-card p-5"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <Sk className="mb-5 h-4 w-36" />
          <div className="space-y-4">
            <EnrolledRoadmapSkeleton />
            <EnrolledRoadmapSkeleton />
          </div>
        </div>
        <div
          className="rounded-2xl border border-border bg-card p-5"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <Sk className="mb-5 h-4 w-44" />
          <div className="space-y-4">
            <RecommendedRoadmapSkeleton />
            <RecommendedRoadmapSkeleton />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        {/* Streak */}
        <div
          className="overflow-hidden rounded-2xl border border-border bg-card"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Sk className="h-4 w-32" />
            <Sk className="h-8 w-8 !rounded-lg" />
          </div>
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-4">
              <Sk className="h-16 !rounded-xl" />
              <Sk className="h-16 !rounded-xl" />
            </div>
            <StreakCalendarSkeleton />
          </div>
        </div>

        {/* Activity */}
        <div
          className="overflow-hidden rounded-2xl border border-border bg-card"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Sk className="h-4 w-28" />
            <Sk className="h-3 w-12" />
          </div>
          <div className="px-5">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <ActivitySkeleton key={i} />
              ))}
          </div>
        </div>

        {/* Achievements */}
        <div
          className="overflow-hidden rounded-2xl border border-border bg-card"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Sk className="h-4 w-36" />
            <Sk className="h-3 w-12" />
          </div>
          <div className="space-y-1 p-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <AchievementSkeleton key={i} />
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);
