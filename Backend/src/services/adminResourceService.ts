import { PrismaClient, Status, Prisma } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import { invalidateCachePattern } from './cacheService';

const prisma = new PrismaClient();

interface ResourceStats {
  total: number;
  active: number;
  pending: number;
  reported: number;
}

interface CategoryData {
  name: string;
  description?: string;
  parentId?: string;
}

// Add type definition at top
type CategoryTree = Prisma.CategoryGetPayload<{
  include: { children: true };
}> & { children?: CategoryTree[] };

// Roadmap Operations
export const getRoadmapStats = async (): Promise<ResourceStats> => {
  const [total, active, pending, reported] = await Promise.all([
    prisma.roadmap.count(),
    prisma.roadmap.count({ where: { isPublic: true } }),
    prisma.roadmap.count({ where: { isPublic: false } }),
    prisma.contentReport.count({ where: { contentType: 'roadmap' } }),
  ]);

  return { total, active, pending, reported };
};

export const manageRoadmap = async (roadmapId: string, action: string) => {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    include: {
      concepts: { include: { subjects: { include: { topics: true } } } },
    },
  });

  if (!roadmap) throw createAppError('Roadmap not found', 404);

  switch (action) {
    case 'publish':
      await prisma.roadmap.update({
        where: { id: roadmapId },
        data: { isPublic: true },
      });
      break;
    case 'unpublish':
      await prisma.roadmap.update({
        where: { id: roadmapId },
        data: { isPublic: false },
      });
      break;
    case 'delete':
      await prisma.roadmap.delete({ where: { id: roadmapId } });
      break;
    default:
      throw createAppError('Invalid action', 400);
  }

  await invalidateCachePattern(`roadmap:${roadmapId}:*`);
};

// Challenge Operations
export const getChallengeStats = async (): Promise<ResourceStats> => {
  const [total, active, pending, reported] = await Promise.all([
    prisma.challenge.count(),
    prisma.challenge.count({ where: { status: 'ACTIVE' } }),
    prisma.challenge.count({ where: { status: 'PENDING' } }),
    prisma.contentReport.count({ where: { contentType: 'CHALLENGE' } }),
  ]);

  return { total, active, pending, reported };
};

export const manageChallenge = async (challengeId: string, action: string) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });
  if (!challenge) throw createAppError('Challenge not found', 404);

  switch (action) {
    case 'activate':
      await prisma.challenge.update({
        where: { id: challengeId },
        data: { status: 'ACTIVE' },
      });
      break;
    case 'deactivate':
      await prisma.challenge.update({
        where: { id: challengeId },
        data: { status: 'ARCHIVED' },
      });
      break;
    case 'delete':
      await prisma.challenge.delete({ where: { id: challengeId } });
      break;
    default:
      throw createAppError('Invalid action', 400);
  }

  await invalidateCachePattern(`challenge:${challengeId}:*`);
};

// Article Operations
export const getArticleStats = async (): Promise<ResourceStats> => {
  const [total, approved, pending, reported] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: Status.APPROVED } }),
    prisma.article.count({ where: { status: 'PENDING' } }),
    prisma.contentReport.count({ where: { contentType: 'ARTICLE' } }),
  ]);

  return { total, active: approved, pending, reported };
};

export const manageArticle = async (articleId: string, action: string) => {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw createAppError('Article not found', 404);

  switch (action) {
    case 'approve':
      await prisma.article.update({
        where: { id: articleId },
        data: { status: Status.APPROVED },
      });
      break;
    case 'reject':
      await prisma.article.update({
        where: { id: articleId },
        data: { status: Status.REJECTED },
      });
      break;
    case 'delete':
      await prisma.article.delete({ where: { id: articleId } });
      break;
    default:
      throw createAppError('Invalid action', 400);
  }

  await invalidateCachePattern(`article:${articleId}:*`);
};

// Resource Allocation
export const allocateResources = async (
  resourceType: string,
  resourceId: string,
  allocation: Record<string, unknown>
) => {
  const model = prisma[resourceType as keyof typeof prisma] as unknown as {
    update: (args: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => Promise<unknown>;
  };

  await model.update({ where: { id: resourceId }, data: allocation });

  await prisma.moderationLog.create({
    data: {
      contentId: resourceId,
      contentType: resourceType,
      action: 'resource_allocation',
      notes: JSON.stringify(allocation),
      moderatorId: allocation.moderatorId as string,
    },
  });
};

// Category Management
export const manageCategories = async (data: CategoryData, action: string) => {
  switch (action) {
    case 'create':
      return prisma.category.create({ data });
    case 'update':
      return prisma.category.update({ where: { name: data.name }, data });
    case 'delete':
      return prisma.category.delete({ where: { name: data.name } });
    default:
      throw createAppError('Invalid action', 400);
  }
};

export const getCategoryHierarchy = async () => {
  const categories = await prisma.category.findMany({
    include: { children: { include: { children: true } } },
    where: { parentId: null },
  });
  return buildCategoryTree(categories as CategoryTree[]);
};

const buildCategoryTree = (categories: CategoryTree[]): CategoryTree[] => {
  return categories.map((category) => ({
    ...category,
    children: category.children ? buildCategoryTree(category.children) : [],
  }));
};
