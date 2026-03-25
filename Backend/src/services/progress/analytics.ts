import { Status, SubmissionStatus } from '@prisma/client';
import logger from '../../utils/logger';

import prisma from '@/lib/prisma';

interface ProgressStats {
  total_topics: number;
  completed_topics: number;
  progress_percentage: number;
  recent_activity: ActivityLog[];
}

interface ActivityLog {
  type: 'topic_completed' | 'quiz_completed' | 'challenge_completed';
  entity_id: string;
  timestamp: Date;
  details: Record<string, unknown>;
}

export async function getUserProgress(user_id: string): Promise<ProgressStats> {
  try {
    const [total_topics, completed_topics, recent_activity] = await Promise.all(
      [
        prisma.topic.count(),
        prisma.progress.count({
          where: { user_id: user_id, status: Status.APPROVED },
        }),
        getUserRecentActivity(user_id),
      ]
    );

    logger.info('Retrieved user progress', {
      user_id,
      completed_topics,
      total_topics,
    });

    return {
      total_topics,
      completed_topics,
      progress_percentage: total_topics
        ? (completed_topics / total_topics) * 100
        : 0,
      recent_activity,
    };
  } catch (error) {
    logger.error('Error getting user progress:', error);
    throw error;
  }
}

async function getUserRecentActivity(user_id: string): Promise<ActivityLog[]> {
  const [topic_progress, quiz_submissions, challenge_submissions] =
    await Promise.all([
      prisma.progress.findMany({
        where: { user_id: user_id, status: Status.APPROVED },
        orderBy: { updated_at: 'desc' },
        take: 10,
        include: { topic: true, roadmap: true },
      }),
      prisma.quizSubmission.findMany({
        where: { user_id: user_id, is_passed: true },
        orderBy: { created_at: 'desc' },
        take: 10,
        include: { quiz: true },
      }),
      prisma.challengeSubmission.findMany({
        where: { user_id: user_id, status: SubmissionStatus.accepted },
        orderBy: { created_at: 'desc' },
        take: 10,
        include: { challenge: true },
      }),
    ]);

  const activity = [
    ...topic_progress.map(
      (p): ActivityLog => ({
        type: 'topic_completed',
        entity_id: p.topic_id,
        timestamp: p.updated_at,
        details: {
          topic_title: p.topic.title,
          roadmap_title: p.roadmap.title,
        },
      })
    ),
    ...quiz_submissions.map(
      (q): ActivityLog => ({
        type: 'quiz_completed',
        entity_id: q.quiz_id,
        timestamp: q.created_at,
        details: {
          quiz_title: q.quiz.title,
          score: q.score,
        },
      })
    ),
    ...challenge_submissions.map(
      (c): ActivityLog => ({
        type: 'challenge_completed',
        entity_id: c.challenge_id,
        timestamp: c.created_at,
        details: {
          challenge_title: c.challenge.title,
        },
      })
    ),
  ] satisfies ActivityLog[];

  return activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
