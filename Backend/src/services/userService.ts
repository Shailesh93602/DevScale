import { PrismaClient, ExperienceLevel } from '@prisma/client';
import type { UserProfileData, UserProgressData } from '../types/userTypes';

const prisma = new PrismaClient();

export async function createUserProfile(userId: string, data: UserProfileData) {
  return prisma.user.create({
    data: {
      supabase_id: userId,
      experience_level: data.experienceLevel,
      ...data,
    },
  });
}

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfileData>
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function updateUserPoints(
  userId: string,
  points: number
): Promise<void> {
  await prisma.userPoints.upsert({
    where: { userId },
    update: { points: { increment: points } },
    create: { userId, points },
  });
}

export async function updateUserProgress(
  userId: string,
  data: UserProgressData
): Promise<void> {
  await prisma.userProgress.upsert({
    where: { userId_topicId: { userId, topicId: data.topicId } },
    update: {
      isCompleted: data.isCompleted,
      completedAt: data.isCompleted ? new Date() : null,
      timeSpent: data.timeSpent,
    },
    create: {
      userId,
      topicId: data.topicId,
      isCompleted: data.isCompleted,
      completedAt: data.isCompleted ? new Date() : null,
      timeSpent: data.timeSpent ?? 0,
      subjectId: '',
    },
  });
}

export async function getUserProgress(userId: string) {
  const progress = await prisma.userProgress.findMany({
    where: { userId },
    include: {
      topic: {
        select: {
          title: true,
          subject: {
            select: {
              title: true,
              mainConcept: {
                select: {
                  name: true,
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
  });

  const points = await prisma.userPoints.findUnique({
    where: { userId },
  });

  return {
    progress,
    totalPoints: points?.points ?? 0,
    completedTopics: progress.filter((p) => p.isCompleted).length,
    inProgressTopics: progress.filter((p) => !p.isCompleted).length,
  };
}

export async function getAchievements(userId: string) {
  const progress = await getUserProgress(userId);
  const achievements = [];

  // Define achievement thresholds
  if (progress.totalPoints >= 1000) achievements.push('Points Master');
  if (progress.completedTopics >= 10) achievements.push('Learning Explorer');
  if (progress.completedTopics >= 50) achievements.push('Knowledge Warrior');
  // Add more achievements as needed

  return achievements;
}

export async function calculateExperienceLevel(
  userId: string
): Promise<ExperienceLevel> {
  const { totalPoints } = await getUserProgress(userId);

  if (totalPoints >= 5000) return 'expert';
  if (totalPoints >= 2000) return 'advanced';
  if (totalPoints >= 500) return 'intermediate';
  return 'beginner';
}
