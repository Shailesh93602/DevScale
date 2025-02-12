import { PrismaClient, Status, Topic } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';

const prisma = new PrismaClient();

export interface DailyTopicStats {
  views: number;
  completions: number;
  averageTimeSpent: number;
  engagementRate: number;
}

export const getDailyTopic = async (userId?: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if a daily topic is already set for today
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dailyTopic: any = await prisma.dailyTopic.findFirst({
    where: {
      date: today,
    },
    include: {
      topic: {
        include: {
          subject: {
            include: {
              concept: true,
            },
          },
          articles: {
            where: {
              status: Status.APPROVED,
            },
          },
          quizzes: true,
          challenges: true,
        },
      },
      _count: {
        select: {
          views: true,
          completions: true,
        },
      },
    },
  });

  // If no daily topic exists for today, select and create one
  if (!dailyTopic) {
    const topic = await selectNewDailyTopic();
    dailyTopic = await prisma.dailyTopic.create({
      data: {
        topicId: topic.id,
        date: today,
      },
      include: {
        topic: {
          include: {
            subject: {
              include: {
                concept: true,
              },
            },
            articles: {
              where: {
                status: Status.APPROVED,
              },
            },
            quizzes: true,
            challenges: true,
          },
        },
        _count: {
          select: {
            views: true,
            completions: true,
          },
        },
      },
    });
  }

  // Track user view if userId is provided
  if (userId) {
    await trackUserView(dailyTopic.id, userId);
  }

  return {
    ...dailyTopic,
    stats: await getDailyTopicStats(dailyTopic.id),
  };
};

const selectNewDailyTopic = async (): Promise<Topic> => {
  // Get topics that haven't been daily topics recently
  const recentDailyTopics = await prisma.dailyTopic.findMany({
    orderBy: {
      date: 'desc',
    },
    take: 30, // Don't repeat topics from the last 30 days
    select: {
      topicId: true,
    },
  });

  const recentTopicIds = recentDailyTopics.map((dt) => dt.topicId);

  // Select a topic that:
  // 1. Hasn't been featured recently
  // 2. Has approved articles
  // 3. Has quizzes or challenges
  // 4. Preferably has high engagement
  const eligibleTopic = await prisma.topic.findFirst({
    where: {
      NOT: {
        id: {
          in: recentTopicIds,
        },
      },
      articles: {
        some: {
          status: Status.APPROVED,
        },
      },
      OR: [
        {
          quizzes: {
            some: {},
          },
        },
        {
          challenges: {
            some: {},
          },
        },
      ],
    },
    orderBy: {
      userProgress: {
        _count: 'desc',
      },
    },
  });

  if (!eligibleTopic) {
    throw createAppError('No eligible topics found for daily topic', 500);
  }

  return eligibleTopic;
};

const trackUserView = async (
  dailyTopicId: string,
  userId: string
): Promise<void> => {
  await prisma.dailyTopicView.upsert({
    where: {
      userId_dailyTopicId: {
        userId,
        dailyTopicId,
      },
    },
    update: {
      viewCount: {
        increment: 1,
      },
    },
    create: {
      userId,
      dailyTopicId,
      viewCount: 1,
    },
  });
};

export const markTopicComplete = async (
  dailyTopicId: string,
  userId: string
): Promise<void> => {
  await prisma.dailyTopicCompletion.create({
    data: {
      userId,
      dailyTopicId,
      timeSpent: 0, // You can track actual time spent if needed
    },
  });

  // Create achievement if user completes 7 consecutive daily topics
  const consecutiveCompletions = await getConsecutiveCompletions(userId);
  if (consecutiveCompletions >= 7) {
    await prisma.achievement.create({
      data: {
        userId,
        type: 'daily_topic',
        title: 'Weekly Warrior',
        description: 'Completed daily topics for 7 consecutive days!',
        criteria: {
          consecutiveCompletions: 7,
        },
        earnedAt: new Date(),
      },
    });
  }
};

const getConsecutiveCompletions = async (userId: string): Promise<number> => {
  const completions = await prisma.dailyTopicCompletion.findMany({
    where: {
      userId,
    },
    orderBy: {
      created_at: 'desc',
    },
    include: {
      dailyTopic: true,
    },
  });

  let consecutive = 0;
  let lastDate = new Date();

  for (const completion of completions) {
    const completionDate = completion.dailyTopic.date;
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
};

const getDailyTopicStats = async (
  dailyTopicId: string
): Promise<DailyTopicStats> => {
  const [views, completions] = await Promise.all([
    prisma.dailyTopicView.aggregate({
      where: {
        dailyTopicId,
      },
      _sum: {
        viewCount: true,
      },
    }),
    prisma.dailyTopicCompletion.findMany({
      where: {
        dailyTopicId,
      },
      select: {
        timeSpent: true,
      },
    }),
  ]);

  const totalViews = views._sum.viewCount || 0;
  const totalCompletions = completions.length;
  const averageTimeSpent =
    completions.reduce((acc, c) => acc + c.timeSpent, 0) /
    (completions.length || 1);

  return {
    views: totalViews,
    completions: totalCompletions,
    averageTimeSpent,
    engagementRate: totalViews ? totalCompletions / totalViews : 0,
  };
};

export const getTopicStreak = async (
  userId: string
): Promise<{
  currentStreak: number;
  longestStreak: number;
}> => {
  const completions = await prisma.dailyTopicCompletion.findMany({
    where: {
      userId,
    },
    orderBy: {
      created_at: 'desc',
    },
    include: {
      dailyTopic: true,
    },
  });

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate = new Date();

  for (const completion of completions) {
    const completionDate = completion.dailyTopic.date;
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
};
