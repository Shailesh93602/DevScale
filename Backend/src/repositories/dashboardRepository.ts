import BaseRepository from './baseRepository';
import prisma from '../lib/prisma';
import {
  DashboardStats,
} from '../types/dashboard';

export class DashboardRepository extends BaseRepository<typeof prisma.user> {
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

    const completedTopicIdsSet = new Set(userCompletedTopics.map((p) => p.topic_id));
    let completedRoadmaps = 0;
    let inProgressRoadmaps = 0;
    let totalProgressPercentage = 0;

    userRoadmaps.forEach((ur) => {
      const roadmapTopics = ur.roadmap.topics;
      if (roadmapTopics.length === 0) return;

      const completedCount = roadmapTopics.filter((t) =>
        t.topic_id ? completedTopicIdsSet.has(t.topic_id) : false,
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
      userRoadmaps.length > 0 ? Math.round(totalProgressPercentage / userRoadmaps.length) : 0;

    return {
      enrolledRoadmaps: enrolledRoadmapsCount,
      completedRoadmaps,
      inProgressRoadmaps,
      totalTopics,
      totalTopicsCompleted,
      averageProgress,
      streakDays: userStreak?.current_streak || 0,
      totalHoursSpent: Math.round((totalHoursSpent._sum.time_spent || 0) / 60), // Convert minutes to hours
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
      include: {
        user: true,
      },
    });
  }

  async getLearningProgress(userId: string) {
    return this.prismaClient.userProgress.findMany({
      where: { user_id: userId },
      include: {
        topic: true,
      },
    });
  }

  async getAchievements(userId: string) {
    return this.prismaClient.achievement.findMany({
      where: { user_id: userId },
      orderBy: { earned_at: 'desc' },
    });
  }
}
