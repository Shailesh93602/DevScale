'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStreakStats, useWeeklyActivity } from '@/hooks/useStreakApi';
import { StreakCalendar } from '@/components/streak/StreakCalendar';
import { StreakStats } from '@/components/streak/StreakStats';
import { ActivityTimeline } from '@/components/streak/ActivityTimeline';
import { StreakSkeleton } from './components/StreakSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const StreakContent = () => {
  const [fetchStats, { data, isLoading: statsLoading, isError: statsError }] =
    useStreakStats();
  const [
    fetchActivity,
    {
      data: weeklyActivityData,
      isLoading: activityLoading,
      isError: activityError,
    },
  ] = useWeeklyActivity();
  const stats = data && 'data' in data ? (data.data as any) : data;
  const weeklyActivity = weeklyActivityData && 'data' in weeklyActivityData ? (weeklyActivityData.data as any) : weeklyActivityData;

  React.useEffect(() => {
    fetchStats();
    fetchActivity();
  }, [fetchStats, fetchActivity]);

  const isLoading = statsLoading || activityLoading;
  const isError = statsError || activityError;

  if (isLoading) {
    return <StreakSkeleton />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load streak data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-8 text-3xl font-bold">Your Learning Streak</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Streak
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.currentStreak || 0} days
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Longest Streak
              </CardTitle>
              <Award className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.longestStreak || 0} days
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Streak Start
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.streakStartDate
                  ? new Date(stats.streakStartDate).toLocaleDateString()
                  : 'Not started'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.dailyActivities?.reduce(
                  (acc: number, curr: any) => acc + (curr.minutesSpent || 0),
                  0,
                ) || 0}{' '}
                mins
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Streak Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <StreakCalendar
                currentStreak={stats?.currentStreak || 0}
                longestStreak={stats?.longestStreak || 0}
                thisWeek={stats?.dailyActivities || []}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={weeklyActivity || []} />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Streak Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <StreakStats
              stats={stats || null}
              weeklyActivity={weeklyActivity || []}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StreakContent;
