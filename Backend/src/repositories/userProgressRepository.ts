import { ExperienceLevel } from '@prisma/client';
import type { UserProgress } from '@prisma/client';
import BaseRepository from './baseRepository.js';
import logger from '../utils/logger.js';
import { createAppError } from '../utils/errorHandler.js';
import { deleteCache, getCache, setCache } from '../services/cacheService';

import prisma from '../lib/prisma.js';

export default class UserProgressRepository extends BaseRepository< UserProgress, typeof prisma.userProgress > {
  constructor() {
    // Pass the Prisma delegate for the user model (prisma.user)
    super(prisma.userProgress);
  }

  // Get user progress
  async getUserProgress(user_id: string) {
    // Fetch user progress data including related topic information
    const progress = await this.findMany({
      where: { user_id },
      include: {
        topic: {
          select: {
            title: true,
            subjects: {
              select: {
                subject: {
                  select: {
                    title: true,
                    main_concepts: {
                      select: {
                        main_concept: {
                          select: {
                            name: true,
                            roadmaps: {
                              select: {
                                roadmap: {
                                  select: {
                                    title: true,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Fetch user points
    const points = await prisma.userPoints.findUnique({
      where: { user_id },
    });

    // Return an object containing user progress information
    return {
      progress,
      total_points: points?.points ?? 0, // Use 0 if points are not available
      completed_topics: progress.filter((p) => p.is_completed).length,
      in_progress_topics: progress.filter((p) => !p.is_completed).length,
    };
  }

  // Update user progress
  async updateUserProgress(
    user_id: string,
    data: {
      topic_id: string;
      is_completed: boolean;
      timeSpent: number;
    }
  ): Promise<void> {
    await this.upsert({
      where: { user_id_topic_id: { user_id, topic_id: data.topic_id } },
      update: {
        is_completed: data.is_completed,
        completed_at: data.is_completed ? new Date() : null,
        time_spent: data.timeSpent,
      },
      create: {
        user_id,
        topic_id: data.topic_id,
        is_completed: data.is_completed,
        completed_at: data.is_completed ? new Date() : null,
        time_spent: data.timeSpent ?? 0,
      },
    });
  }

  // Get user's achievements
  async getAchievements(userId: string) {
    const progress = await this.getUserProgress(userId);
    const achievements = [];

    if (progress.total_points >= 1000) achievements.push('Points Master');
    if (progress.completed_topics >= 10) achievements.push('Learning Explorer');
    if (progress.completed_topics >= 50) achievements.push('Knowledge Warrior');

    return achievements;
  }

  // Get user's experience level
  async calculateExperienceLevel(user_id: string): Promise<ExperienceLevel> {
    const { total_points } = await this.getUserProgress(user_id);

    if (total_points >= 5000) return 'expert';
    if (total_points >= 2000) return 'advanced';
    if (total_points >= 500) return 'intermediate';
    return 'beginner';
  }

  async getUserAnalytics(userId: string) {
    try {
      const [courseProgress, challengeStats, resourceUsage] = await Promise.all(
        [
          this.findMany({
            where: { user_id: userId },
            include: {
              topic: {
                select: {
                  title: true,
                  subjects: {
                    select: {
                      subject: { select: { title: true } },
                    },
                  },
                },
              },
            },
          }),
          prisma.challengeSubmission.groupBy({
            by: ['status'],
            where: { user_id: userId },
            _count: true,
          }),
          prisma.resource.groupBy({
            by: ['type'],
            where: { user_id: userId },
            _count: true,
          }),
        ]
      );

      return {
        courseProgress,
        challengeStats,
        resourceUsage,
      };
    } catch (error) {
      logger.error('Error: ', error);
      throw createAppError('Failed to fetch user analytics', 500);
    }
  }

  async trackProgress(data: {
    user_id: string;
    topic_id: string;
    subject_id?: string;
    progress_percentage: number;
    is_completed: boolean;
  }) {
    const existing = await this.findFirst({
      where: { user_id: data.user_id, topic_id: data.topic_id },
    });

    const progress = await prisma.userProgress.upsert({
      where: { id: existing?.id ?? '' },
      create: {
        user_id: data.user_id,
        topic_id: data.topic_id,
        subject_id: data.subject_id,
        progress_percentage: data.progress_percentage,
        is_completed: data.is_completed,
        completed_at: data.is_completed ? new Date() : null,
      },
      update: {
        progress_percentage: data.progress_percentage,
        is_completed: data.is_completed,
        completed_at: data.is_completed ? new Date() : null,
      },
    });

    await deleteCache(`user:${data.user_id}:progress`);
    return progress;
  }

  async resetProgress(user_id: string, topic_id: string) {
    await this.deleteMany({
      where: { user_id, topic_id },
    });

    await deleteCache(`user:${user_id}:progress`);
  }

  async calculateLearningPath(user_id: string) {
    const cacheKey = `user:${user_id}:learning-path`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const progress = await prisma.userProgress.findMany({
      where: { user_id },
      include: { topic: true },
    });

    const completed = progress.filter((p) => p.is_completed);
    const recommendations = await prisma.topic.findMany({
      where: {
        OR: [
          { prerequisites: { isEmpty: true } },
          {
            prerequisites: {
              hasEvery: completed
                .map((c) => c.topic_id)
                .filter((id): id is string => id !== null),
            },
          },
        ],
        NOT: {
          id: {
            in: completed
              .map((c) => c.topic_id)
              .filter((id): id is string => id !== null),
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    await setCache(cacheKey, recommendations, { ttl: 3600 });
    return recommendations;
  }
}
