import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { format, startOfWeek, addDays } from 'date-fns';
import { StreakStats as StreakStatsType } from '@/hooks/useStreakApi';
import type { WeeklyActivity } from '@/hooks/useStreakApi';

interface StreakStatsProps {
  stats: StreakStatsType | null;
  weeklyActivity: WeeklyActivity[];
}

export const StreakStats: React.FC<StreakStatsProps> = ({
  stats,
  weeklyActivity,
}) => {
  const weekStart = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const chartData = weekDays.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const activity = weeklyActivity.find(
      (a) => format(new Date(a.timestamp), 'yyyy-MM-dd') === dateStr,
    );
    return {
      name: format(day, 'EEE'),
      minutes: activity ? 1 : 0, // Count activities per day
    };
  });

  const totalActivities = weeklyActivity.length;
  const averageActivities = Math.round(totalActivities / 7);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-gray-500">Total Activities This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{averageActivities}</div>
            <p className="text-xs text-gray-500">Average Activities per Day</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {chartData.filter((d) => d.minutes > 0).length}
            </div>
            <p className="text-xs text-gray-500">Active Days This Week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="minutes"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold">Streak Progress</h3>
              <p className="mt-2 text-sm text-gray-500">
                You&apos;re on day {stats?.currentStreak} of your learning
                streak.
                {stats?.currentStreak > 0 &&
                  ` Keep going to beat your record of ${stats?.longestStreak} days!`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold">Learning Time</h3>
              <p className="mt-2 text-sm text-gray-500">
                Total learning time:{' '}
                {stats?.dailyActivities?.reduce(
                  (acc, curr) => acc + curr.minutesSpent,
                  0,
                )}{' '}
                minutes
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
