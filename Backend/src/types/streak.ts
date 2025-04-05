import { ActivityType } from '@prisma/client';

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  streakStartDate: Date | null;
  timezone: string;
  dailyActivities: DailyActivity[];
}

export interface DailyActivity {
  date: Date;
  minutesSpent: number;
  activityType: ActivityType;
}

export interface UpdateStreakInput {
  activityType: ActivityType;
  minutesSpent: number;
  timezone: string;
}

export interface StreakValidationResult {
  isValid: boolean;
  shouldReset: boolean;
  lastActivityInUserTimezone: Date | null;
  currentDateInUserTimezone: Date;
}

export interface StreakCalculationResult {
  currentStreak: number;
  longestStreak: number;
  streakStartDate: Date | null;
  lastActivityDate: Date | null;
}
