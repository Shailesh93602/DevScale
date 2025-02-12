import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import { getCache, setCache, deleteCache } from './cacheService';

const prisma = new PrismaClient();

interface ProgressUpdate {
  userId: string;
  topicId: string;
  subjectId: string;
  progressPercentage: number;
  isCompleted: boolean;
}

export const trackProgress = async (data: ProgressUpdate) => {
  try {
    const existing = await prisma.userProgress.findFirst({
      where: { userId: data.userId, topicId: data.topicId },
    });

    const progress = await prisma.userProgress.upsert({
      where: { id: existing?.id ?? '' },
      create: {
        userId: data.userId,
        topicId: data.topicId,
        subjectId: data.subjectId,
        progressPercentage: data.progressPercentage,
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : null,
      },
      update: {
        progressPercentage: data.progressPercentage,
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : null,
      },
    });

    await deleteCache(`user:${data.userId}:progress`);
    return progress;
  } catch (error) {
    throw createAppError(
      'Failed to track progress',
      500,
      error as Record<string, unknown>
    );
  }
};

export const getUserProgress = async (userId: string) => {
  const cached = await getCache(`user:${userId}:progress`);
  if (cached) return cached;

  const progress = await prisma.userProgress.findMany({
    where: { userId },
    include: { topic: true },
    orderBy: { completedAt: 'desc' },
  });

  await setCache(`user:${userId}:progress`, progress, { ttl: 3600 });
  return progress;
};

export const resetProgress = async (userId: string, topicId: string) => {
  await prisma.userProgress.deleteMany({
    where: { userId, topicId },
  });

  await deleteCache(`user:${userId}:progress`);
};

export const calculateLearningPath = async (userId: string) => {
  const cacheKey = `user:${userId}:learning-path`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const progress = await prisma.userProgress.findMany({
    where: { userId },
    include: { topic: true },
  });

  const completed = progress.filter((p) => p.isCompleted);
  const recommendations = await prisma.topic.findMany({
    where: {
      OR: [
        { prerequisites: { isEmpty: true } },
        {
          prerequisites: {
            hasEvery: completed
              .map((c) => c.topicId)
              .filter((id): id is string => id !== null),
          },
        },
      ],
      NOT: {
        id: {
          in: completed
            .map((c) => c.topicId)
            .filter((id): id is string => id !== null),
        },
      },
    },
    orderBy: { order: 'asc' },
  });

  await setCache(cacheKey, recommendations, { ttl: 3600 });
  return recommendations;
};
