import { PrismaClient, Prisma } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface UserAnalytics {
  progress: {
    completedTopics: number;
    inProgressTopics: number;
    completionRate: number;
  };
  performance: {
    averageScore: number;
    challengesSolved: number;
    successRate: number;
  };
  engagement: {
    articleCount: number;
    forumPosts: number;
    studyGroupCount: number;
    lastActive: Date;
  };
}

interface PlatformAnalytics {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
  };
  contentStats: {
    totalArticles: number;
    totalChallenges: number;
    totalResources: number;
  };
  engagementStats: {
    averageTimeSpent: number;
    completionRates: Record<string, number>;
    popularTopics: Array<{ topic: string; count: number }>;
  };
  errorStats: {
    totalErrors: number;
    criticalErrors: number;
    errorRates: Record<string, number>;
  };
}

export const getUserAnalytics = async (
  userId: string
): Promise<UserAnalytics> => {
  if (!userId) {
    throw createAppError('Invalid user ID format', 400);
  }

  const [progress, submissions, engagementData] = await Promise.all([
    prisma.userProgress.findMany({ where: { userId } }),
    prisma.challengeSubmission.findMany({ where: { userId } }),
    Promise.all([
      prisma.article.count({ where: { authorId: userId } }),
      prisma.forumPost.count({ where: { userId } }),
      prisma.studyGroupMember.count({ where: { userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { updated_at: true },
      }),
    ]),
  ]);

  const completedTopics = progress.filter((p) => p.isCompleted).length;
  const totalTopics = progress.length;
  const successfulSubmissions = submissions.filter(
    (s) => s.status === 'accepted'
  ).length;

  return {
    progress: {
      completedTopics,
      inProgressTopics: totalTopics - completedTopics,
      completionRate: totalTopics ? completedTopics / totalTopics : 0,
    },
    performance: {
      averageScore:
        submissions.reduce((acc, s) => acc + (s.score || 0), 0) /
        (submissions.length || 1),
      challengesSolved: successfulSubmissions,
      successRate: submissions.length
        ? successfulSubmissions / submissions.length
        : 0,
    },
    engagement: {
      articleCount: engagementData[0],
      forumPosts: engagementData[1],
      studyGroupCount: engagementData[2],
      lastActive: engagementData[3]?.updated_at || new Date(),
    },
  };
};

export const getPlatformAnalytics = async (
  startDate?: Date,
  endDate?: Date
): Promise<PlatformAnalytics> => {
  const dateFilter = {
    created_at: { gte: startDate, lte: endDate },
  };

  const [userStats, contentStats, popularTopics, errorStats] =
    await Promise.all([
      getUserStats(dateFilter),
      getContentStats(),
      getPopularTopics(),
      getErrorStats(startDate, endDate),
    ]);

  return {
    userStats,
    contentStats,
    engagementStats: {
      averageTimeSpent: await calculateAverageTimeSpent(),
      completionRates: await calculateCompletionRates(),
      popularTopics: popularTopics.map((t) => ({
        topic: t.title,
        count: t._count.userProgress,
      })),
    },
    errorStats,
  };
};

const calculateAverageTimeSpent = async (): Promise<number> => {
  const sessions = await prisma.userSession.findMany({
    where: {
      endTime: { not: null },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  if (sessions.length === 0) return 0;

  const totalDuration = sessions.reduce((acc, session) => {
    const duration = session.endTime!.getTime() - session.startTime.getTime();
    return acc + duration;
  }, 0);

  return totalDuration / sessions.length / 1000; // Return in seconds
};

const calculateCompletionRates = async (): Promise<Record<string, number>> => {
  const topics = await prisma.topic.findMany({
    include: {
      _count: {
        select: {
          userProgress: true,
        },
      },
      userProgress: {
        where: {
          isCompleted: true,
        },
      },
    },
  });

  return topics.reduce(
    (acc, topic) => ({
      ...acc,
      [topic.title]:
        topic._count.userProgress > 0
          ? topic.userProgress.length / topic._count.userProgress
          : 0,
    }),
    {}
  );
};

const getErrorStats = async (startDate?: Date, endDate?: Date) => {
  const whereClause: Prisma.ActivityLogWhereInput = {
    timestamp: {
      gte: startDate,
      lte: endDate,
    },
    activity: {
      contains: 'error',
      mode: 'insensitive' as const,
    },
  };

  const [totalErrors, criticalErrors, errorTypes] = await Promise.all([
    prisma.activityLog.count({
      where: whereClause,
    }),
    prisma.activityLog.count({
      where: {
        ...whereClause,
        metadata: {
          path: ['severity'],
          equals: 'CRITICAL',
        },
      },
    }),
    prisma.activityLog.groupBy({
      by: ['activity'],
      where: whereClause,
      _count: {
        activity: true,
      },
    }),
  ]);

  const total = totalErrors || 1; // Prevent division by zero
  const errorRates = errorTypes.reduce(
    (acc, { activity, _count }) => ({
      ...acc,
      [activity]: _count.activity / total,
    }),
    {}
  );

  return {
    totalErrors,
    criticalErrors,
    errorRates,
  };
};

const TRACKING_LIMIT = 100;
export const trackUserActivity = async (
  userId: string,
  activity: string,
  metadata?: Record<string, unknown>
): Promise<void> => {
  try {
    // Check rate limit
    const recentActivities = await prisma.activityLog.count({
      where: {
        userId,
        timestamp: {
          gte: new Date(Date.now() - 60 * 1000), // Last minute
        },
      },
    });

    if (recentActivities >= TRACKING_LIMIT) {
      logger.warn(`Activity tracking limit reached for user ${userId}`);
      return;
    }

    await prisma.activityLog.create({
      data: {
        userId,
        activity,
        metadata: (metadata as Prisma.InputJsonValue) ?? Prisma.DbNull,
        timestamp: new Date(),
        deviceType: 'WEB',
      },
    });
  } catch (error) {
    logger.error('Error tracking user activity:', error);
    throw error;
  }
};

export const generateReport = async (
  type: 'user' | 'platform',
  id?: string,
  dateRange?: { start: Date; end: Date }
): Promise<UserAnalytics | PlatformAnalytics> => {
  try {
    if (type === 'user') {
      if (!id) {
        throw createAppError('Invalid user ID for report generation', 400);
      }
      return await getUserAnalytics(id);
    }

    // Validate platform analytics date range
    if (dateRange?.start && dateRange?.end) {
      const diff = dateRange.end.getTime() - dateRange.start.getTime();
      const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year

      if (diff > maxRange) {
        throw createAppError(
          'Date range exceeds maximum allowed duration',
          400
        );
      }
    }

    return await getPlatformAnalytics(dateRange?.start, dateRange?.end);
  } catch (error) {
    logger.error('Error generating report:', error);
    throw createAppError('Failed to generate report', 500);
  }
};

async function getUserStats(dateFilter: Prisma.UserWhereInput) {
  const [totalUsers, newUsers, activeUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: dateFilter,
    }),
    prisma.user.count({
      where: {
        updated_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
  ]);

  return {
    totalUsers,
    activeUsers,
    newUsers,
  };
}

async function getContentStats() {
  const [articles, challenges, resources] = await Promise.all([
    prisma.article.count(),
    prisma.challenge.count(),
    prisma.resource.count(),
  ]);

  return {
    totalArticles: articles,
    totalChallenges: challenges,
    totalResources: resources,
  };
}

async function getPopularTopics() {
  const popularTopics = await prisma.topic.findMany({
    select: {
      title: true,
      _count: {
        select: {
          userProgress: true,
        },
      },
    },
    orderBy: {
      userProgress: {
        _count: 'desc',
      },
    },
    take: 10,
  });

  return popularTopics;
}
