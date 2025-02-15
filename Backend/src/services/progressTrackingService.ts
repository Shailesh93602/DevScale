import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import { getCache, setCache, deleteCache } from './cacheService';

const prisma = new PrismaClient();

interface ProgressUpdate {
  user_id: string;
  topic_id: string;
  subject_id: string;
  progress_percentage: number;
  is_completed: boolean;
}

export const trackProgress = async (data: ProgressUpdate) => {
  try {
    const existing = await prisma.userProgress.findFirst({
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
  } catch (error) {
    throw createAppError(
      'Failed to track progress',
      500,
      error as Record<string, unknown>
    );
  }
};

export const getUserProgress = async (user_id: string) => {
  const cached = await getCache(`user:${user_id}:progress`);
  if (cached) return cached;

  const progress = await prisma.userProgress.findMany({
    where: { user_id },
    include: { topic: true },
    orderBy: { completed_at: 'desc' },
  });

  await setCache(`user:${user_id}:progress`, progress, { ttl: 3600 });
  return progress;
};

export const resetProgress = async (user_id: string, topic_id: string) => {
  await prisma.userProgress.deleteMany({
    where: { user_id, topic_id },
  });

  await deleteCache(`user:${user_id}:progress`);
};

export const calculateLearningPath = async (user_id: string) => {
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
};
