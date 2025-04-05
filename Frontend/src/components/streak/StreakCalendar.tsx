import React from 'react';
import { subDays, format, eachDayOfInterval } from 'date-fns';

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
  thisWeek: {
    date: string;
    minutesSpent: number;
  }[];
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({
  currentStreak,
  longestStreak,
  thisWeek,
}) => {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
  const activeDates = thisWeek.reduce(
    (acc, activity) => {
      acc[format(new Date(activity.date), 'yyyy-MM-dd')] =
        activity.minutesSpent;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500">Current Streak</p>
          <p className="text-2xl font-bold">{currentStreak} days</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Longest Streak</p>
          <p className="text-2xl font-bold">{longestStreak} days</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isActive = dateStr in activeDates;
          return (
            <div
              key={dateStr}
              className={`aspect-square rounded-sm p-1 text-center text-xs ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded-sm bg-primary" />
          <span className="text-sm text-gray-500">Active Learning Day</span>
        </div>
      </div>
    </div>
  );
};
