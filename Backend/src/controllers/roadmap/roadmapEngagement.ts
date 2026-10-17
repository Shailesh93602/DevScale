import prisma from '../../lib/prisma.js';
import { invalidatePattern } from '../../services/memoryCache.js';
import { invalidateCachePattern } from '../../services/cacheService.js';

/** Drops every viewer's cached detail (Redis + in-process); lists too if asked. */
export async function invalidateRoadmapCaches(
  roadmapId: string,
  { lists = false } = {}
): Promise<void> {
  invalidatePattern(`roadmap:detail:${roadmapId}`);
  await invalidateCachePattern(`roadmap:detail:${roadmapId}:*`);
  if (lists) await invalidateCachePattern('roadmaps:list:*');
}

/** Flips the viewer's like on a roadmap; null when the roadmap does not exist. */
export async function toggleRoadmapLike(
  userId: string,
  roadmapId: string
): Promise<'liked' | 'unliked' | null> {
  // Lightweight existence check — avoid full getRoadmap() query
  const roadmapExists = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    select: { id: true },
  });
  if (!roadmapExists) return null;

  const existingLike = await prisma.like.findFirst({
    where: { user_id: userId, roadmap_id: roadmapId },
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
  } else {
    await prisma.like.create({
      data: { user_id: userId, roadmap_id: roadmapId },
    });
  }
  await invalidateRoadmapCaches(roadmapId);
  return existingLike ? 'unliked' : 'liked';
}

/** Flips the viewer's bookmark (a UserRoadmap row); null when no such roadmap. */
export async function toggleRoadmapBookmark(
  userId: string,
  roadmapId: string
): Promise<'bookmarked' | 'unbookmarked' | null> {
  const roadmapExists = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    select: { id: true },
  });
  if (!roadmapExists) return null;

  const existingBookmark = await prisma.userRoadmap.findFirst({
    where: { user_id: userId, roadmap_id: roadmapId },
  });

  if (existingBookmark) {
    await prisma.userRoadmap.delete({ where: { id: existingBookmark.id } });
  } else {
    await prisma.userRoadmap.create({
      data: { user_id: userId, roadmap_id: roadmapId },
    });
  }

  await invalidateRoadmapCaches(roadmapId);
  invalidatePattern(`dashboard:summary:${userId}`); // Ensure dashboard reflects change
  return existingBookmark ? 'unbookmarked' : 'bookmarked';
}

/** Flips the viewer's like on a comment; true when a like was removed. */
export async function toggleCommentLikeRow(
  userId: string,
  commentId: string
): Promise<boolean> {
  const existingLike = await prisma.like.findFirst({
    where: { user_id: userId, comment_id: commentId },
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
  } else {
    await prisma.like.create({
      data: { user_id: userId, comment_id: commentId },
    });
  }
  return Boolean(existingLike);
}

/** Ids of the given comments the viewer has liked, in ONE query. */
export async function getLikedCommentIds(
  userId: string | undefined,
  commentIds: string[]
): Promise<Set<string>> {
  const likedSet = new Set<string>();
  if (!userId || commentIds.length === 0) return likedSet;

  const likedComments = await prisma.like.findMany({
    where: { user_id: userId, comment_id: { in: commentIds } },
    select: { comment_id: true },
  });
  likedComments.forEach((l) => {
    if (l.comment_id) likedSet.add(l.comment_id);
  });
  return likedSet;
}
