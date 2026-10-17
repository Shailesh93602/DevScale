import { useAxiosGet, useAxiosPut } from './useAxios';

export interface DailyActivity {
  date: string;
  minutesSpent: number;
  activityType: string;
}

/** What `GET /streak/weekly-activity` returns: one row per (day, activity type). */
export type WeeklyActivity = DailyActivity;

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  streakStartDate: string | null;
  lastActivityDate: string | null;
  dailyActivities: DailyActivity[];
}

export const useStreakStats = () => {
  return useAxiosGet<StreakStats>('/streak/stats');
};

export const useWeeklyActivity = () => {
  return useAxiosGet<WeeklyActivity[]>('/streak/weekly-activity');
};

export const useUpdateStreak = () => {
  return useAxiosPut<
    StreakStats,
    { activityType: string; minutesSpent: number }
  >('/streak/update');
};
