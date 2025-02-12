import { PrismaClient, Resource, Difficulty } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import { getCache, setCache, deleteCache } from './cacheService';

const prisma = new PrismaClient();

interface ResourceData {
  title: string;
  description: string;
  type: string;
  url: string;
  category: string;
  content?: string;
  tags?: string[];
  userId: string;
  difficulty: Difficulty;
  language: string;
}

export const createResource = async (data: ResourceData): Promise<Resource> => {
  try {
    const { userId, ...resourceData } = data;
    const resource = await prisma.resource.create({
      data: {
        ...resourceData,
        tags: data.tags || [],
        user: { connect: { id: userId } },
      },
      include: { user: { select: { username: true, avatar_url: true } } },
    });

    await deleteCache('resources:all');
    return resource;
  } catch (error) {
    throw createAppError(
      'Failed to create resource',
      500,
      error as Record<string, unknown>
    );
  }
};

export const getResources = async (filters?: {
  category?: string;
  type?: string;
  tags?: string[];
  search?: string;
}) => {
  const cacheKey = `resources:${JSON.stringify(filters)}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const resources = await prisma.resource.findMany({
    where: {
      category: filters?.category,
      type: filters?.type,
      tags: filters?.tags ? { hasEvery: filters.tags } : undefined,
      OR: filters?.search
        ? [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
            { content: { contains: filters.search, mode: 'insensitive' } },
          ]
        : undefined,
    },
    include: {
      user: { select: { username: true, avatar_url: true } },
      _count: { select: { articles: true, interviewQuestions: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  await setCache(cacheKey, resources, { ttl: 3600 });
  return resources;
};

export const getResource = async (id: string): Promise<Resource> => {
  const cacheKey = `resource:${id}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached as Resource;

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      user: { select: { username: true, avatar_url: true } },
      articles: true,
      interviewQuestions: true,
    },
  });

  if (!resource) throw createAppError('Resource not found', 404);

  await setCache(cacheKey, resource, { ttl: 3600 });
  return resource;
};

export const updateResource = async (
  id: string,
  data: Partial<ResourceData>
): Promise<Resource> => {
  const { userId, ...updateData } = data;

  const resource = await prisma.resource.update({
    where: { id },
    data: {
      ...updateData,
      user: userId ? { connect: { id: userId } } : undefined,
    },
    include: { user: { select: { username: true, avatar_url: true } } },
  });

  await deleteCache(`resource:${id}`);
  await deleteCache('resources:all');
  return resource;
};

export const deleteResource = async (id: string): Promise<void> => {
  await prisma.resource.delete({ where: { id } });
  await deleteCache(`resource:${id}`);
  await deleteCache('resources:all');
};
