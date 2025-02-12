import { PrismaClient, Status } from '@prisma/client';
import logger from '../../utils/logger';
import { getUserProgress } from './analytics';

const prisma = new PrismaClient();

// Add this interface for the completed topics
interface CompletedTopic {
  topicId: string;
}

export async function getLearningPathRecommendations(userId: string) {
  try {
    const [userProgress, userSkills, completedTopics] = await Promise.all([
      getUserProgress(userId),
      getUserSkills(userId),
      getCompletedTopics(userId),
    ]);

    return {
      nextTopics: await getNextTopics(userId, completedTopics),
      relatedRoadmaps: await getRelatedRoadmaps(userSkills),
      challengeRecommendations: await getChallengeRecommendations(
        userId,
        userProgress.progressPercentage
      ),
      skillGaps: await identifySkillGaps(userId, userSkills),
      progressStats: {
        completedTopics: userProgress.completedTopics,
        totalTopics: userProgress.totalTopics,
        progressPercentage: userProgress.progressPercentage,
        recentActivity: userProgress.recentActivity,
      },
    };
  } catch (error) {
    logger.error('Failed to generate recommendations:', error);
    throw error;
  }
}

async function getUserSkills(userId: string) {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { skills: true },
  });
  return profile?.skills || [];
}

async function getCompletedTopics(userId: string) {
  return prisma.progress.findMany({
    where: { userId, status: Status.APPROVED },
    select: { topicId: true },
  });
}

async function getNextTopics(
  userId: string,
  completedTopics: CompletedTopic[]
) {
  const completedIds = completedTopics.map((t) => t.topicId);

  return prisma.topic.findMany({
    where: {
      id: { notIn: completedIds },
      roadmaps: {
        some: {
          progress: { some: { userId, status: Status.APPROVED } },
        },
      },
    },
    orderBy: { order: 'asc' },
    take: 5,
  });
}

async function getRelatedRoadmaps(userSkills: string[]) {
  return prisma.roadmap.findMany({
    where: {
      topics: {
        some: {
          OR: [
            { content: { contains: userSkills[0] } },
            ...userSkills.slice(1).map((skill) => ({
              content: { contains: skill },
            })),
          ],
        },
      },
    },
    take: 3,
  });
}

async function getChallengeRecommendations(
  userId: string,
  progressPercentage: number
) {
  const userLevel = await getUserLevel(userId);
  const difficulty = mapProgressToDifficulty(progressPercentage, userLevel);

  return prisma.challenge.findMany({
    where: {
      difficulty,
      submissions: { none: { userId } },
    },
    take: 5,
  });
}

async function identifySkillGaps(userId: string, userSkills: string[]) {
  const popularSkills = await prisma.user.findMany({
    select: { skills: true },
    take: 100,
  });

  const skillFrequency = popularSkills.reduce<Record<string, number>>(
    (acc, profile) => {
      profile.skills.forEach((skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    },
    {}
  );

  return Object.entries(skillFrequency)
    .filter(([skill]) => !userSkills.includes(skill))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([skill]) => skill);
}

// Helper functions
async function getUserLevel(userId: string) {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { experience_level: true },
  });
  return profile?.experience_level;
}

function mapProgressToDifficulty(progressPercentage: number, level?: string) {
  if (level === 'EXPERT' || progressPercentage > 90) return 'HARD';
  if (level === 'ADVANCED' || progressPercentage > 70) return 'MEDIUM';

  return 'EASY';
}
