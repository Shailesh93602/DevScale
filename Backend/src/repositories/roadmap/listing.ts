import type { Request } from 'express';
import prisma from '../../lib/prisma.js';
import { roadmapViewFields, type RoadmapListItem } from './roadmapShapes.js';

export interface RoadmapListQuery {
  limit: number;
  page: number;
  search: string;
  category: string;
  difficulty: string;
  sort: string;
  userId?: string;
}

const queryString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

export function parseRoadmapListQuery(req: Request): RoadmapListQuery {
  return {
    limit: Number(req.query.limit) || 10,
    page: Number(req.query.page) || 1,
    search: queryString(req.query.search),
    category: queryString(req.query.category),
    difficulty: queryString(req.query.difficulty),
    sort: queryString(req.query.sort, 'popular'),
    userId: req.user?.id,
  };
}

export function getRoadmapSortOptions(sort: string) {
  switch (sort) {
    case 'recent':
      return { field: 'created_at', direction: 'desc' as const };
    case 'popular':
    case 'rating':
    default:
      return { field: 'popularity', direction: 'desc' as const };
  }
}

const topicIdsOf = (roadmap: RoadmapListItem): string[] =>
  (roadmap.topics || []).map((t) => t.topic.id);

/** Percentage of each roadmap's topics the viewer has completed, by roadmap id. */
export async function calculateUserProgress(
  userId: string | undefined,
  roadmapsData: RoadmapListItem[]
) {
  const userProgressMap: Record<string, number> = {};
  if (!userId || roadmapsData.length === 0) return userProgressMap;

  const roadmapTopicIds = roadmapsData.flatMap(topicIdsOf);
  if (roadmapTopicIds.length === 0) return userProgressMap;

  const userProgress = await prisma.userProgress.findMany({
    where: {
      user_id: userId,
      topic_id: { in: roadmapTopicIds },
      is_completed: true,
    },
    select: { topic_id: true },
  });

  const completedTopicIds = new Set(
    userProgress.map((p) => p.topic_id).filter(Boolean) as string[]
  );

  roadmapsData.forEach((roadmap) => {
    if (roadmap.id && roadmap.topics) {
      const roadmapTopics = topicIdsOf(roadmap);
      const completedCount = roadmapTopics.filter((topicId) =>
        completedTopicIds.has(topicId)
      ).length;
      userProgressMap[roadmap.id] =
        roadmapTopics.length > 0
          ? Math.round((completedCount / roadmapTopics.length) * 100)
          : 0;
    }
  });

  return userProgressMap;
}

export function formatRoadmapResponse(
  roadmap: RoadmapListItem,
  progress: number
) {
  return {
    ...roadmap,
    topics: undefined, // Remove heavy topics array from serialized response
    ...roadmapViewFields(roadmap, progress),
  };
}
