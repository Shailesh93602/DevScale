import { PrismaClient, Status } from '@prisma/client';
import logger from '../../utils/logger';
import { getUserProgress } from './analytics';

const prisma = new PrismaClient();

// Add this interface for the completed topics
interface CompletedTopic {
  topic_id: string;
}

export async function getLearningPathRecommendations(user_id: string) {
  try {
    const [userProgress, userSkills, completedTopics] = await Promise.all([
      getUserProgress(user_id),
      getUserSkills(user_id),
      getCompletedTopics(user_id),
    ]);

    return {
      nextTopics: await getNextTopics(user_id, completedTopics),
      relatedRoadmaps: await getRelatedRoadmaps(userSkills),
      challengeRecommendations: await getChallengeRecommendations(
        user_id,
        userProgress.progress_percentage
      ),
      skillGaps: await identifySkillGaps(user_id, userSkills),
      progressStats: {
        completed_topics: userProgress.completed_topics,
        total_topics: userProgress.total_topics,
        progress_percentage: userProgress.progress_percentage,
        recent_activity: userProgress.recent_activity,
      },
    };
  } catch (error) {
    logger.error('Failed to generate recommendations:', error);
    throw error;
  }
}

async function getUserSkills(user_id: string) {
  const profile = await prisma.user.findUnique({
    where: { id: user_id },
    select: { skills: true },
  });
  return profile?.skills || [];
}

async function getCompletedTopics(user_id: string) {
  return prisma.progress.findMany({
    where: { user_id: user_id, status: Status.APPROVED },
    select: { topic_id: true },
  });
}

async function getNextTopics(
  user_id: string,
  completed_topics: CompletedTopic[]
) {
  const completed_ids = completed_topics.map((t) => t.topic_id);

  return prisma.topic.findMany({
    where: {
      id: { notIn: completed_ids },
      roadmaps: {
        some: {
          progress: { some: { user_id: user_id, status: Status.APPROVED } },
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
  user_id: string,
  progress_percentage: number
) {
  const user_level = await getUserLevel(user_id);
  const difficulty = mapProgressToDifficulty(progress_percentage, user_level);

  return prisma.challenge.findMany({
    where: {
      difficulty,
      submissions: { none: { user_id } },
    },
    take: 5,
  });
}

async function identifySkillGaps(user_id: string, user_skills: string[]) {
  const popular_skills = await prisma.user.findMany({
    select: { skills: true },
    take: 100,
  });

  const skill_frequency = popular_skills.reduce<Record<string, number>>(
    (acc, profile) => {
      profile.skills.forEach((skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    },
    {}
  );

  return Object.entries(skill_frequency)
    .filter(([skill]) => !user_skills.includes(skill))
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([skill]) => skill);
}

// Helper functions
async function getUserLevel(user_id: string) {
  const profile = await prisma.user.findUnique({
    where: { id: user_id },
    select: { experience_level: true },
  });
  return profile?.experience_level;
}

function mapProgressToDifficulty(progress_percentage: number, level?: string) {
  if (level === 'EXPERT' || progress_percentage > 90) return 'HARD';
  if (level === 'ADVANCED' || progress_percentage > 70) return 'MEDIUM';

  return 'EASY';
}
