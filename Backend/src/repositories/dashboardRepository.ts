import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';
import prisma from '../lib/prisma';
import { DashboardStats } from '@/types';

export class DashboardRepository extends BaseRepository<typeof prisma.user> {
  constructor() {
    super(prisma.user);
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const [
      enrolledRoadmaps,
      totalTopics,
      totalTopicsCompleted,
      totalHoursSpent,
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
    ]);

    return {
      enrolledRoadmaps,
      totalTopics,
      totalTopicsCompleted,
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
