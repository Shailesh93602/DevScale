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
  parent_id?: string;
}

// Add type definition at top
type CategoryTree = Prisma.CategoryGetPayload<{
  include: { children: true };
}> & { children?: CategoryTree[] };

// Roadmap Operations
export const getRoadmapStats = async (): Promise<ResourceStats> => {
  const [total, active, pending, reported] = await Promise.all([
    prisma.roadmap.count(),
    prisma.roadmap.count({ where: { is_public: true } }),
    prisma.roadmap.count({ where: { is_public: false } }),
    prisma.contentReport.count({ where: { content_type: 'roadmap' } }),
  ]);

  return { total, active, pending, reported };
};

export const manageRoadmap = async (roadmap_id: string, action: string) => {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmap_id },
    include: {
      topics: true,
    },
  });

  if (!roadmap) throw createAppError('Roadmap not found', 404);

  switch (action) {
    case 'publish':
      await prisma.roadmap.update({
        where: { id: roadmap_id },
        data: { is_public: true },
      });
      break;
    case 'unpublish':
      await prisma.roadmap.update({
        where: { id: roadmap_id },
        data: { is_public: false },
      });
      break;
    case 'delete':
      await prisma.roadmap.delete({ where: { id: roadmap_id } });
      break;
    default:
      throw createAppError('Invalid action', 400);
  }

  await invalidateCachePattern(`roadmap:${roadmap_id}:*`);
};

// Challenge Operations
export const getChallengeStats = async (): Promise<ResourceStats> => {
  const [total, active, pending, reported] = await Promise.all([
    prisma.challenge.count(),
    prisma.challenge.count({ where: { status: 'ACTIVE' } }),
    prisma.challenge.count({ where: { status: 'PENDING' } }),
    prisma.contentReport.count({ where: { content_type: 'CHALLENGE' } }),
  ]);

  return { total, active, pending, reported };
};

export const manageChallenge = async (challenge_id: string, action: string) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challenge_id },
  });
  if (!challenge) throw createAppError('Challenge not found', 404);

  switch (action) {
    case 'activate':
      await prisma.challenge.update({
        where: { id: challenge_id },
        data: { status: 'ACTIVE' },
      });
      break;
    case 'deactivate':
      await prisma.challenge.update({
        where: { id: challenge_id },
        data: { status: 'ARCHIVED' },
      });
      break;
    case 'delete':
      await prisma.challenge.delete({ where: { id: challenge_id } });
      break;
    default:
      throw createAppError('Invalid action', 400);
  }

  await invalidateCachePattern(`challenge:${challenge_id}:*`);
};

// Article Operations
export const getArticleStats = async (): Promise<ResourceStats> => {
  const [total, approved, pending, reported] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: Status.APPROVED } }),
    prisma.article.count({ where: { status: 'PENDING' } }),
    prisma.contentReport.count({ where: { content_type: 'ARTICLE' } }),
  ]);

  return { total, active: approved, pending, reported };
};

export const manageArticle = async (article_id: string, action: string) => {
  const article = await prisma.article.findUnique({
    where: { id: article_id },
  });
  if (!article) throw createAppError('Article not found', 404);

  switch (action) {
    case 'approve':
      await prisma.article.update({
        where: { id: article_id },
        data: { status: Status.APPROVED },
      });
      break;
    case 'reject':
      await prisma.article.update({
        where: { id: article_id },
        data: { status: Status.REJECTED },
      });
      break;
    case 'delete':
      await prisma.article.delete({ where: { id: article_id } });
      break;
    default:
      throw createAppError('Invalid action', 400);
  }

  await invalidateCachePattern(`article:${article_id}:*`);
};

// Resource Allocation
export const allocateResources = async (
  resource_type: string,
  resource_id: string,
  allocation: Record<string, unknown>
) => {
  const model = prisma[resource_type as keyof typeof prisma] as unknown as {
    update: (args: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => Promise<unknown>;
  };

  await model.update({ where: { id: resource_id }, data: allocation });

  await prisma.moderationLog.create({
    data: {
      content_id: resource_id,
      content_type: resource_type,
      action: 'resource_allocation',
      notes: JSON.stringify(allocation),
      moderator_id: allocation.moderator_id as string,
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
    where: { parent_id: null },
  });
  return buildCategoryTree(categories as CategoryTree[]);
};

const buildCategoryTree = (categories: CategoryTree[]): CategoryTree[] => {
  return categories.map((category) => ({
    ...category,
    children: category.children ? buildCategoryTree(category.children) : [],
  }));
};
