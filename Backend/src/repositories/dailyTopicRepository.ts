import { PrismaClient, Status, Topic } from '@prisma/client';
import { createAppError } from '../utils/errorHandler.js';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

interface DailyTopicStats {
  views: number;
  completions: number;
  averageTimeSpent: number;
  engagementRate: number;
}

export default class DailyTopicRepository extends BaseRepository<
  PrismaClient['dailyTopic']
> {
  constructor() {
    super(prisma.dailyTopic);
  }

  async getDailyTopic(user_id?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyTopic = await this.findFirst({
      where: { date: today },
      include: {
        topic: {
          include: {
            subjects: { select: { subject: { select: { id: true } } } },
            articles: { where: { status: Status.APPROVED } },
            quizzes: true,
            challenges: true,
          },
        },
        _count: { select: { views: true, completions: true } },
      },
    });

    if (!dailyTopic) {
      const topic = await this.selectNewDailyTopic();
      dailyTopic = await this.create({
        data: { topic_id: topic.id, date: today },
        include: {
          topic: {
            include: {
              subjects: {
                include: { subject: { include: { main_concepts: true } } },
              },
              articles: { where: { status: Status.APPROVED } },
              quizzes: true,
              challenges: true,
            },
          },
          _count: { select: { views: true, completions: true } },
        },
      });
    }

    if (user_id) {
      await this.trackUserView(dailyTopic.id, user_id);
    }

    return {
      ...dailyTopic,
      stats: await this.getDailyTopicStats(dailyTopic.id),
    };
  }

  private async selectNewDailyTopic(): Promise<Topic> {
    const recentDailyTopics = await this.findMany({
      orderBy: { date: 'desc' },
      take: 30,
      select: { topic_id: true },
    });

    const recentTopicIds = recentDailyTopics.map((dt) => dt.topic_id);

    const eligibleTopic = await prisma.topic.findFirst({
      where: {
        NOT: { id: { in: recentTopicIds } },
        articles: { some: { status: Status.APPROVED } },
        OR: [{ quizzes: { some: {} } }, { challenges: { some: {} } }],
      },
      orderBy: { user_progress: { _count: 'desc' } },
    });

    if (!eligibleTopic) {
      throw createAppError('No eligible topics found for daily topic', 500);
    }

    return eligibleTopic;
  }

  private async trackUserView(
    daily_topic_id: string,
    user_id: string
  ): Promise<void> {
    await prisma.dailyTopicView.upsert({
      where: { user_id_daily_topic_id: { user_id, daily_topic_id } },
      update: { view_count: { increment: 1 } },
      create: { user_id, daily_topic_id, view_count: 1 },
    });
  }

  async markTopicComplete(
    daily_topic_id: string,
    user_id: string
  ): Promise<void> {
    await prisma.dailyTopicCompletion.create({
      data: { user_id, daily_topic_id, time_spent: 0 },
    });

    const consecutiveCompletions =
      await this.getConsecutiveCompletions(user_id);
    if (consecutiveCompletions >= 7) {
      await prisma.achievement.create({
        data: {
          user_id,
          type: 'daily_topic',
          title: 'Weekly Warrior',
          description: 'Completed daily topics for 7 consecutive days!',
          criteria: { consecutiveCompletions: 7 },
          earned_at: new Date(),
        },
      });
    }
  }

  private async getConsecutiveCompletions(user_id: string): Promise<number> {
    const completions = await prisma.dailyTopicCompletion.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
      include: { daily_topic: true },
    });

    let consecutive = 0;
    let lastDate = new Date();

    for (const completion of completions) {
      const completionDate = completion.daily_topic.date;
      const diffDays = Math.floor(
        (lastDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        consecutive++;
        lastDate = completionDate;
      } else {
        break;
      }
    }

    return consecutive;
  }

  private async getDailyTopicStats(
    daily_topic_id: string
  ): Promise<DailyTopicStats> {
    const [views, completions] = await Promise.all([
      prisma.dailyTopicView.aggregate({
        where: { daily_topic_id },
        _sum: { view_count: true },
      }),
      prisma.dailyTopicCompletion.findMany({
        where: { daily_topic_id },
        select: { time_spent: true },
      }),
    ]);

    const totalViews = views._sum.view_count || 0;
    const totalCompletions = completions.length;
    const averageTimeSpent =
      completions.reduce((acc, c) => acc + c.time_spent, 0) /
      (completions.length || 1);

    return {
      views: totalViews,
      completions: totalCompletions,
      averageTimeSpent,
      engagementRate: totalViews ? totalCompletions / totalViews : 0,
    };
  }

  async getTopicStreak(user_id: string): Promise<{
    currentStreak: number;
    longestStreak: number;
  }> {
    const completions = await prisma.dailyTopicCompletion.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
      include: { daily_topic: true },
    });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = new Date();

    for (const completion of completions) {
      const completionDate = completion.daily_topic.date;
      const diffDays = Math.floor(
        (lastDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
        if (currentStreak === 0) {
          currentStreak = tempStreak;
        }
        lastDate = completionDate;
      } else {
        tempStreak = 0;
        if (currentStreak === 0) {
          currentStreak = 1;
        }
        break;
      }
    }

    return {
      currentStreak,
      longestStreak,
    };
  }
}
