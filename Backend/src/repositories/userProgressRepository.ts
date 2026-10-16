import { ExperienceLevel } from '../constants/enums';
import type { UserProgress } from '@prisma/client';
import BaseRepository from './baseRepository.js';
import logger from '../utils/logger.js';
import { createAppError } from '../utils/errorHandler.js';
import { deleteCache, getCache, setCache } from '../services/cacheService';

import prisma from '../lib/prisma.js';

export default class UserProgressRepository extends BaseRepository<
  UserProgress,
  typeof prisma.userProgress
> {
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
  /**
   * Records progress and returns true only when this call should pay the
   * topic-completion points: the first time the topic is marked completed.
   * `points_awarded` is set in the same conditional updateMany (or create), so
   * two concurrent completions cannot both pay, and un-completing then
   * re-completing pays nothing. A topic completed by its quiz has not been
   * paid yet, so a later completion pays once. time_spent is left alone (this
   * endpoint does not measure it).
   */
  async updateUserProgress(
    user_id: string,
    data: { topic_id: string; is_completed: boolean }
  ): Promise<boolean> {
    const { topic_id } = data;

    if (!data.is_completed) {
      await prisma.userProgress.upsert({
        where: { user_id_topic_id: { user_id, topic_id } },
        update: { is_completed: false, completed_at: null },
        create: { user_id, topic_id, is_completed: false, time_spent: 0 },
      });
      return false;
    }

    const now = new Date();
    const pay = async () =>
      (
        await prisma.userProgress.updateMany({
          where: { user_id, topic_id, points_awarded: false },
          data: { is_completed: true, completed_at: now, points_awarded: true },
        })
      ).count === 1;

    if (await pay()) return true;
    // Row exists and was already paid: re-complete it without paying.
    const recompleted = await prisma.userProgress.updateMany({
      where: { user_id, topic_id, is_completed: false },
      data: { is_completed: true, completed_at: now },
    });
    if (recompleted.count === 1) return false;
    try {
      await prisma.userProgress.create({
        data: {
          user_id,
          topic_id,
          is_completed: true,
          completed_at: now,
          time_spent: 0,
          points_awarded: true,
        },
      });
      return true;
    } catch (error) {
      // P2002: the row exists (already completed, or created concurrently).
      if ((error as { code?: string })?.code !== 'P2002') throw error;
      return pay();
    }
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
