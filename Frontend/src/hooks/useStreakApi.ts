import { useAxiosGet, useAxiosPut } from './useAxios';

export interface DailyActivity {
  date: string;
  minutesSpent: number;
  activityType: string;
}

export interface WeeklyActivity {
  id: string;
  type:
    | 'completed_topic'
    | 'enrolled_roadmap'
    | 'friend_activity'
    | 'liked_roadmap';
  description: string;
  timestamp: string;
  roadmapId: string;
  roadmapTitle: string;
  user?: {
    id: string;
    name: string;
    profileImage?: string;
  };
}

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
