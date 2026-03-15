import { useAxiosGet } from './useAxios';

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakStartDate: string | null;
  timezone: string;
  dailyActivities: DailyActivity[];
}

export interface DailyActivity {
  date: string;
  minutesSpent: number;
  activityType:
    | 'TOPIC_COMPLETION'
    | 'QUIZ_COMPLETION'
    | 'CODE_CHALLENGE'
    | 'RESOURCE_STUDY'
    | 'PRACTICE_SESSION';
}

export interface WeeklyActivity {
  date: string;
  active: boolean;
  minutesLearned: number;
}

export const useStreak = () => {
  const [getStreakStats] = useAxiosGet<StreakStats>('/streak/stats');
  const [getWeeklyActivity] = useAxiosGet<WeeklyActivity[]>(
    '/streak/weekly-activity',
  );

  return {
    getStreakStats,
    getWeeklyActivity,
  };
};
