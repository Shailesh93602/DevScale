import React from 'react';
import { motion } from 'framer-motion';

export const StatCardSkeleton: React.FC = () => (
  <div className="flex h-32 flex-col justify-between rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
    <div className="mb-2 h-4 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
    <div className="mb-4 h-8 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
    <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
  </div>
);

export const AchievementSkeleton: React.FC = () => (
  <div className="flex animate-pulse items-center gap-3 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
    <div className="flex-1">
      <div className="mb-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  </div>
);

export const ActivitySkeleton: React.FC = () => (
  <div className="flex animate-pulse items-start gap-3 border-b border-gray-100 p-3 dark:border-gray-700">
    <div className="mt-1 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
    <div className="flex-1">
      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-1 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  </div>
);

export const EnrolledRoadmapSkeleton: React.FC = () => (
  <div className="animate-pulse overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
    <div className="h-32 bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-4">
      <div className="mb-2 h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-3 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-2 h-2 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
);

export const RecommendedRoadmapSkeleton: React.FC = () => (
  <div className="animate-pulse overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
    <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-4">
      <div className="mb-2 h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-3 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-2 h-3 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-3 h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
);

export const StreakCalendarSkeleton: React.FC = () => (
  <div className="grid animate-pulse grid-cols-7 gap-2">
    {Array(7)
      .fill(0)
      .map((_, i) => (
        <div
          key={i}
          className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700"
        ></div>
      ))}
  </div>
);

export const EventSkeleton: React.FC = () => (
  <div className="animate-pulse border-b border-gray-100 p-3 dark:border-gray-700">
    <div className="mb-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
    <div className="mb-2 h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
    <div className="flex items-center">
      <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-3 xl:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
      </div>

      {/* Main Column */}
      <div className="space-y-6 lg:col-span-2">
        {/* Enrolled Roadmaps */}
        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <div className="mb-4 h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <EnrolledRoadmapSkeleton key={i} />
              ))}
          </div>
        </div>

        {/* Recommended Roadmaps */}
        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <div className="mb-4 h-6 w-2/5 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array(2)
              .fill(0)
              .map((_, i) => (
                <RecommendedRoadmapSkeleton key={i} />
              ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Learning Streak */}
        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <div className="mb-4 h-6 w-2/5 rounded bg-gray-200 dark:bg-gray-700"></div>
          <StreakCalendarSkeleton />
          <div className="mt-4 flex justify-between">
            <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <div className="mb-4 h-6 w-2/5 rounded bg-gray-200 dark:bg-gray-700"></div>
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <ActivitySkeleton key={i} />
            ))}
        </div>

        {/* Achievements */}
        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <div className="mb-4 h-6 w-2/5 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-3">
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
