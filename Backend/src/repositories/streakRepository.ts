import { ActivityType, Prisma } from '@prisma/client';
import type { UserStreak } from '@prisma/client';
import { DateTime } from 'luxon';
import BaseRepository from './baseRepository.js';
import prisma from '../lib/prisma.js';
import {
  StreakStats,
  DailyActivity,
  StreakValidationResult,
  StreakCalculationResult,
} from '../types/streak';

interface UpdateStreakParams {
  activityType: ActivityType;
  minutesSpent: number;
  timezone: string;
}

export default class StreakRepository extends BaseRepository<
  UserStreak,
  typeof prisma.userStreak
> {
  constructor() {
    super(prisma.userStreak);
  }

  private convertToUserTimezone(date: Date, timezone: string): DateTime {
    return DateTime.fromJSDate(date).setZone(timezone);
  }

  private isDateInStreak(
    lastActivityDate: Date | null,
    currentDate: Date,
    timezone: string
  ): boolean {
    if (!lastActivityDate) return false;

    const lastActivityInUserTz = this.convertToUserTimezone(
      lastActivityDate,
      timezone
    );
    const currentDateInUserTz = this.convertToUserTimezone(
      currentDate,
      timezone
    );

    const diffInDays = currentDateInUserTz.diff(
      lastActivityInUserTz,
      'days'
    ).days;
    return diffInDays <= 1;
  }

  private validateStreak(
    lastActivityDate: Date | null,
    timezone: string
  ): StreakValidationResult {
    const currentDate = new Date();
    const currentDateInUserTz = this.convertToUserTimezone(
      currentDate,
      timezone
    );
    const lastActivityInUserTz = lastActivityDate
      ? this.convertToUserTimezone(lastActivityDate, timezone)
      : null;

    const isValid = this.isDateInStreak(
      lastActivityDate,
      currentDate,
      timezone
    );
    const shouldReset = lastActivityDate ? !isValid : false;

    return {
      isValid,
      shouldReset,
      lastActivityInUserTimezone: lastActivityInUserTz?.toJSDate() || null,
      currentDateInUserTimezone: currentDateInUserTz.toJSDate(),
    };
  }

  private calculateNewStreakValues(
    currentStreak: number,
    longestStreak: number,
    validationResult: StreakValidationResult
  ): StreakCalculationResult {
    let newCurrentStreak = currentStreak;
    let newLongestStreak = longestStreak;
    let streakStartDate: Date | null = null;
    let lastActivityDate: Date | null = null;

    if (validationResult.shouldReset) {
      newCurrentStreak = 1;
      streakStartDate = validationResult.currentDateInUserTimezone;
    } else if (validationResult.isValid) {
      newCurrentStreak += 1;
      newLongestStreak = Math.max(newCurrentStreak, newLongestStreak);
      streakStartDate = validationResult.lastActivityInUserTimezone;
    }

    lastActivityDate = validationResult.currentDateInUserTimezone;

    return {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      streakStartDate,
      lastActivityDate,
    };
  }

  async getUserStreak(userId: string): Promise<StreakStats | null> {
    const query = {
      where: { user_id: userId },
      include: {
        daily_activities: {
          orderBy: { created_at: 'desc' as const },
          take: 30,
        },
      },
    } satisfies Prisma.UserStreakFindUniqueArgs;

    const userStreak = await prisma.userStreak.findUnique(query);

    if (!userStreak) return null;

    return {
      currentStreak: userStreak.current_streak,
      longestStreak: userStreak.longest_streak,
      lastActivityDate: userStreak.last_activity_date,
      streakStartDate: userStreak.streak_start_date,
      timezone: userStreak.timezone,
      dailyActivities: userStreak.daily_activities.map((activity) => ({
        date: activity.created_at,
        minutesSpent: activity.minutes_spent,
        activityType: activity.activity_type,
      })),
    };
  }

  async updateStreak(
    userId: string,
    params: UpdateStreakParams
  ): Promise<void> {
    const { activityType, minutesSpent, timezone } = params;
    const now = DateTime.now().setZone(timezone);

    await this.prismaClient.$transaction(async (tx) => {
      // Record the activity
      await tx.userDailyActivity.create({
        data: {
          user_id: userId,
          activity_type: activityType,
          minutes_spent: minutesSpent,
          created_at: now.toJSDate(),
        },
      });

      // Update streak
      const userStreak = await tx.userStreak.findUnique({
        where: { user_id: userId },
      });

      if (!userStreak) {
        await tx.userStreak.create({
          data: {
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: now.toJSDate(),
          },
        });
        return;
      }

      if (!userStreak.last_activity_date) {
        await tx.userStreak.update({
          where: { user_id: userId },
          data: {
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: now.toJSDate(),
          },
        });
        return;
      }

      const lastActivityDate = DateTime.fromJSDate(
        userStreak.last_activity_date
      );
      const daysSinceLastActivity = now.diff(lastActivityDate, 'days').days;

      let newCurrentStreak = userStreak.current_streak;
      if (daysSinceLastActivity <= 1) {
        newCurrentStreak += 1;
      } else {
        newCurrentStreak = 1;
      }

      await tx.userStreak.update({
        where: { user_id: userId },
        data: {
          current_streak: newCurrentStreak,
          longest_streak: Math.max(newCurrentStreak, userStreak.longest_streak),
          last_activity_date: now.toJSDate(),
        },
      });
    });
  }

  async resetStreak(userId: string): Promise<void> {
    await prisma.userStreak.update({
      where: { user_id: userId },
      data: {
        current_streak: 0,
        last_activity_date: null,
        streak_start_date: null,
      },
    });
  }

  async getWeeklyActivity(userId: string): Promise<DailyActivity[]> {
    const sevenDaysAgo = DateTime.now().minus({ days: 7 }).toJSDate();

    const activities = await this.prismaClient.userDailyActivity.groupBy({
      by: ['created_at', 'activity_type'],
      where: {
        user_id: userId,
        created_at: {
          gte: sevenDaysAgo,
        },
      },
      _sum: {
        minutes_spent: true,
      },
    });

    return activities.map((activity) => ({
      date: activity.created_at,
      minutesSpent: activity._sum?.minutes_spent || 0,
      activityType: activity.activity_type,
    }));
  }
}
