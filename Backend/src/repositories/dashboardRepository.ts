import type { User } from '@prisma/client';
import BaseRepository from './baseRepository.js';
import prisma from '../lib/prisma.js';
import { DashboardStats } from '../types/dashboard';
import {
  getCached,
  setCached,
  invalidatePattern,
} from '../services/memoryCache';

// Raw SQL row shapes
interface RoadmapRow {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  topics_count: bigint;
}

interface SummaryQueryResult {
  enrolled_count: number;
  completed_topics_count: number;
  total_time_spent: number;
  total_topics: number;
  streak: {
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    streak_start_date: string | null;
    timezone: string;
  } | null;
  enrolled_roadmaps: RoadmapRow[] | null;
  recommended_roadmaps: RoadmapRow[] | null;
  activities: Array<{
    id: string;
    action: string;
    details: Record<string, unknown> | null;
    timestamp: string;
  }> | null;
  achievements: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    criteria: Record<string, unknown>;
    earned_at: string;
  }> | null;
  weekly_activity: Array<{
    created_at: string;
    activity_type: string;
    minutes_spent: number;
  }> | null;
}

export class DashboardRepository extends BaseRepository<
  User,
  typeof prisma.user
> {
  /**
   * Promise coalescing — if two requests arrive before the first completes,
   * they share the same in-flight promise instead of triggering duplicate DB calls.
   */
  private readonly _pending = new Map<string, Promise<unknown>>();

  constructor() {
    super(prisma.user);
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const [
      enrolledRoadmapsCount,
      totalTopics,
      totalTopicsCompleted,
      totalHoursSpent,
      userStreak,
      userRoadmaps,
      userCompletedTopics,
    ] = await Promise.all([
      this.prismaClient.userRoadmap.count({
        where: { user_id: userId },
      }),
      this.prismaClient.topic.count(),
      this.prismaClient.userProgress.count({
        where: {
          user_id: userId,
          is_completed: true,
        },
      }),
      this.prismaClient.userProgress.aggregate({
        where: {
          user_id: userId,
          is_completed: true,
        },
        _sum: {
          time_spent: true,
        },
      }),
      this.prismaClient.userStreak.findUnique({
        where: { user_id: userId },
        select: { current_streak: true },
      }),
      this.prismaClient.userRoadmap.findMany({
        where: { user_id: userId },
        include: {
          roadmap: {
            include: {
              topics: {
                select: {
                  topic_id: true,
                },
              },
            },
          },
        },
      }),
      this.prismaClient.userProgress.findMany({
        where: {
          user_id: userId,
          is_completed: true,
        },
        select: {
          topic_id: true,
        },
      }),
    ]);

    const completedTopicIdsSet = new Set(
      userCompletedTopics.map((p) => p.topic_id)
    );
    let completedRoadmaps = 0;
    let inProgressRoadmaps = 0;
    let totalProgressPercentage = 0;

    userRoadmaps.forEach((ur) => {
      const roadmapTopics = ur.roadmap.topics;
      if (roadmapTopics.length === 0) return;

      const completedCount = roadmapTopics.filter((t) =>
        t.topic_id ? completedTopicIdsSet.has(t.topic_id) : false
      ).length;
      const progress = (completedCount / roadmapTopics.length) * 100;
      totalProgressPercentage += progress;

      if (progress === 100) {
        completedRoadmaps++;
      } else if (progress > 0) {
        inProgressRoadmaps++;
      }
    });

    const averageProgress =
      userRoadmaps.length > 0
        ? Math.round(totalProgressPercentage / userRoadmaps.length)
        : 0;

    return {
      enrolledRoadmaps: enrolledRoadmapsCount,
      completedRoadmaps,
      inProgressRoadmaps,
      totalTopics,
      totalTopicsCompleted,
      averageProgress,
      streakDays: userStreak?.current_streak || 0,
      totalHoursSpent: Math.round((totalHoursSpent._sum.time_spent || 0) / 60),
    };
  }

  async getEnrolledRoadmaps(userId: string) {
    return this.prismaClient.userRoadmap.findMany({
      where: { user_id: userId },
      include: {
        roadmap: {
          include: {
            user: {
              select: {
                username: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });
  }

  async getRecommendedRoadmaps(userId: string) {
    return this.prismaClient.roadmap.findMany({
      where: {
        is_public: true,
        NOT: {
          user_roadmaps: {
            some: {
              user_id: userId,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
      },
      take: 5,
    });
  }

  async getRecentActivities(userId: string) {
    return this.prismaClient.userActivityLog.findMany({
      where: { user_id: userId },
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: { id: true, action: true, details: true, timestamp: true },
    });
  }

  async getLearningProgress(userId: string, page = 1, limit = 50) {
    const skip = (Math.max(1, page) - 1) * limit;
    const [items, total] = await this.prismaClient.$transaction([
      this.prismaClient.userProgress.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          topic_id: true,
          is_completed: true,
          time_spent: true,
          updated_at: true,
          topic: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
        orderBy: { updated_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaClient.userProgress.count({ where: { user_id: userId } }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAchievements(userId: string) {
    return this.prismaClient.achievement.findMany({
      where: { user_id: userId },
      orderBy: { earned_at: 'desc' },
    });
  }

  /**
   * Single aggregated endpoint — replaces 10 separate dashboard API calls.
   * Uses a single raw SQL query with correlated subqueries to eliminate all
   * Prisma N+1 round-trips and reduce network hops to 1.
   * Promise-coalesced so simultaneous requests share one DB call.
   * Result cached 300s per user.
   */
  async getDashboardSummary(userId: string) {
    const cacheKey = `dashboard:summary:${userId}`;

    // 1. In-memory cache hit (warm path — ~0 ms)
    const cached =
      getCached<Awaited<ReturnType<typeof this._buildSummary>>>(cacheKey);
    if (cached) return cached;

    // 2. Promise coalescing — if a build is already in-flight for this user,
    //    return the same promise instead of launching a duplicate DB call.
    const inflight = this._pending.get(userId);
    if (inflight) return inflight;

    const promise = this._buildSummary(userId)
      .then((result) => {
        setCached(cacheKey, result, 300); // 5-minute cache
        return result;
      })
      .finally(() => {
        this._pending.delete(userId);
      });

    this._pending.set(userId, promise);
    return promise;
  }

  /** Invalidate the per-user summary cache (call after any write that affects dashboard data). */
  invalidateSummaryCache(userId: string) {
    invalidatePattern(`dashboard:summary:${userId}`);
  }

  /**
   * Single raw SQL query — all 10 subqueries execute server-side in one round trip.
   * Previously: 10x Promise.all(prisma.X) = 10 network hops to remote DB (~2-6s)
   * Now:        1x $queryRaw with correlated subqueries = 1 network hop (~50-200ms)
   */
  private async _buildSummary(userId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [row] = await this.prismaClient.$queryRaw<SummaryQueryResult[]>`
      SELECT
        -- Scalar stats (4 fast COUNT/SUM subqueries, all hit indexed columns)
        (SELECT COUNT(*)::int FROM "UserRoadmap"  WHERE user_id = ${userId})                                 AS enrolled_count,
        (SELECT COUNT(*)::int FROM "UserProgress" WHERE user_id = ${userId} AND is_completed = true)        AS completed_topics_count,
        (SELECT COALESCE(SUM(time_spent), 0)::int FROM "UserProgress" WHERE user_id = ${userId} AND is_completed = true) AS total_time_spent,
        (SELECT COUNT(*)::int FROM "Topic")                                                                  AS total_topics,

        -- Streak (single unique-index lookup)
        (
          SELECT row_to_json(s)
          FROM (
            SELECT current_streak, longest_streak, last_activity_date, streak_start_date, timezone
            FROM user_streaks
            WHERE user_id = ${userId}
          ) s
        ) AS streak,

        -- Top-2 enrolled roadmaps (uses new UserRoadmap(user_id, created_at) index)
        (
          SELECT COALESCE(json_agg(er), '[]'::json)
          FROM (
            SELECT
              r.id, r.title, r.description,
              u.id AS user_id, u.username, u.first_name, u.last_name, u.avatar_url,
              (SELECT COUNT(*)::int FROM "RoadmapTopic" rt WHERE rt.roadmap_id = r.id) AS topics_count
            FROM "UserRoadmap" ur
            JOIN "Roadmap" r ON r.id = ur.roadmap_id
            JOIN "User"    u ON u.id = r.user_id
            WHERE ur.user_id = ${userId}
            ORDER BY ur.created_at DESC
            LIMIT 2
          ) er
        ) AS enrolled_roadmaps,

        -- Top-2 recommended roadmaps (uses Roadmap(is_public, popularity) index)
        (
          SELECT COALESCE(json_agg(rr), '[]'::json)
          FROM (
            SELECT
              r.id, r.title, r.description,
              u.id AS user_id, u.username, u.first_name, u.last_name, u.avatar_url,
              (SELECT COUNT(*)::int FROM "RoadmapTopic" rt WHERE rt.roadmap_id = r.id) AS topics_count
            FROM "Roadmap" r
            JOIN "User" u ON u.id = r.user_id
            WHERE r.is_public = true
              AND r.deleted_at IS NULL
              AND NOT EXISTS (
                SELECT 1 FROM "UserRoadmap" ur2
                WHERE ur2.user_id = ${userId} AND ur2.roadmap_id = r.id
              )
            ORDER BY r.popularity DESC
            LIMIT 2
          ) rr
        ) AS recommended_roadmaps,

        -- Top-5 activities (uses new UserActivityLog(user_id, timestamp) index)
        (
          SELECT COALESCE(json_agg(act), '[]'::json)
          FROM (
            SELECT id, action, details, timestamp
            FROM "UserActivityLog"
            WHERE user_id = ${userId}
            ORDER BY timestamp DESC
            LIMIT 5
          ) act
        ) AS activities,

        -- Top-5 achievements (uses new Achievement(user_id, earned_at) index)
        (
          SELECT COALESCE(json_agg(ach), '[]'::json)
          FROM (
            SELECT id, type, title, description, criteria, earned_at
            FROM "Achievement"
            WHERE user_id = ${userId}
            ORDER BY earned_at DESC
            LIMIT 5
          ) ach
        ) AS achievements,

        -- Weekly activity (uses existing UserDailyActivity(user_id, created_at) index)
        (
          SELECT COALESCE(json_agg(wa), '[]'::json)
          FROM (
            SELECT
              (DATE(created_at))::text AS created_at,
              activity_type,
              SUM(minutes_spent)::int  AS minutes_spent
            FROM user_daily_activities
            WHERE user_id = ${userId}
              AND created_at >= ${sevenDaysAgo}
            GROUP BY DATE(created_at), activity_type
          ) wa
        ) AS weekly_activity
    `;

    // Parse JSON columns (Prisma returns them as objects from pg; guard for edge cases)
    const parse = <T>(val: T | string | null | undefined, fallback: T): T => {
      if (val === null || val === undefined) return fallback;
      if (typeof val === 'string') {
        try {
          return JSON.parse(val) as T;
        } catch {
          return fallback;
        }
      }
      return val as T;
    };

    const enrolled = parse<RoadmapRow[]>(row.enrolled_roadmaps, []);
    const recommended = parse<RoadmapRow[]>(row.recommended_roadmaps, []);
    const activities = parse<SummaryQueryResult['activities']>(
      row.activities,
      []
    );
    const achievements = parse<SummaryQueryResult['achievements']>(
      row.achievements,
      []
    );
    const weeklyActivity = parse<SummaryQueryResult['weekly_activity']>(
      row.weekly_activity,
      []
    );
    const streak = parse<SummaryQueryResult['streak']>(row.streak, null);

    const shapeRoadmap = (r: RoadmapRow) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      user: {
        id: r.user_id,
        username: r.username,
        first_name: r.first_name,
        last_name: r.last_name,
        avatar_url: r.avatar_url,
      },
      _count: {
        topics: Number(r.topics_count),
        likes: 0,
        user_roadmaps: 0,
      },
    });

    return {
      stats: {
        enrolledRoadmaps: row.enrolled_count,
        totalTopicsCompleted: row.completed_topics_count,
        totalTopics: row.total_topics,
        totalHoursSpent: Math.round(row.total_time_spent / 60),
        averageProgress: 0,
        battleRank: undefined as string | undefined,
      },
      enrolledRoadmaps: enrolled.map(shapeRoadmap),
      recommendedRoadmaps: recommended.map(shapeRoadmap),
      activities: (activities ?? []) as Array<{
        id: string;
        action: string;
        details: Record<string, unknown> | null;
        timestamp: string;
      }>,
      achievements: (achievements ?? []) as Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        criteria: Record<string, unknown>;
        earned_at: string;
      }>,
      streak: streak
        ? {
            currentStreak: streak.current_streak,
            longestStreak: streak.longest_streak,
            lastActivityDate: streak.last_activity_date,
            streakStartDate: streak.streak_start_date,
            timezone: streak.timezone,
          }
        : null,
      weeklyActivity: (weeklyActivity ?? []).map((w) => ({
        date: w.created_at,
        minutesSpent: w.minutes_spent,
        activityType: w.activity_type,
      })),
    };
  }
}
