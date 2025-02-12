import { PrismaClient, Status, SubmissionStatus } from '@prisma/client';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

interface ProgressStats {
  totalTopics: number;
  completedTopics: number;
  progressPercentage: number;
  recentActivity: ActivityLog[];
}

interface ActivityLog {
  type: 'topic_completed' | 'quiz_completed' | 'challenge_completed';
  entityId: string;
  timestamp: Date;
  details: Record<string, unknown>;
}

export async function getUserProgress(userId: string): Promise<ProgressStats> {
  try {
    const [totalTopics, completedTopics, recentActivity] = await Promise.all([
      prisma.topic.count(),
      prisma.progress.count({
        where: { userId, status: Status.APPROVED },
      }),
      getUserRecentActivity(userId),
    ]);

    logger.info('Retrieved user progress', {
      userId,
      completedTopics,
      totalTopics,
    });

    return {
      totalTopics,
      completedTopics,
      progressPercentage: totalTopics
        ? (completedTopics / totalTopics) * 100
        : 0,
      recentActivity,
    };
  } catch (error) {
    logger.error('Error getting user progress:', error);
    throw error;
  }
}

async function getUserRecentActivity(userId: string): Promise<ActivityLog[]> {
  const [topicProgress, quizSubmissions, challengeSubmissions] =
    await Promise.all([
      prisma.progress.findMany({
        where: { userId, status: Status.APPROVED },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: { topic: true, roadmap: true },
      }),
      prisma.quizSubmission.findMany({
        where: { userId, isPassed: true },
        orderBy: { created_at: 'desc' },
        take: 10,
        include: { quiz: true },
      }),
      prisma.challengeSubmission.findMany({
        where: { userId, status: SubmissionStatus.accepted },
        orderBy: { created_at: 'desc' },
        take: 10,
        include: { challenge: true },
      }),
    ]);

  const activity = [
    ...topicProgress.map(
      (p): ActivityLog => ({
        type: 'topic_completed',
        entityId: p.topicId,
        timestamp: p.updatedAt,
        details: {
          topicTitle: p.topic.title,
          roadmapTitle: p.roadmap.title,
        },
      })
    ),
    ...quizSubmissions.map(
      (q): ActivityLog => ({
        type: 'quiz_completed',
        entityId: q.quizId,
        timestamp: q.created_at,
        details: {
          quizTitle: q.quiz.title,
          score: q.score,
        },
      })
    ),
    ...challengeSubmissions.map(
      (c): ActivityLog => ({
        type: 'challenge_completed',
        entityId: c.challengeId,
        timestamp: c.created_at,
        details: {
          challengeTitle: c.challenge.title,
        },
      })
    ),
  ] satisfies ActivityLog[];

  return activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
