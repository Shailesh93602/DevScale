import { PrismaClient, Resource } from '@prisma/client';
import { createAppError } from '../utils/errorHandler.js';
import { getCache, setCache, deleteCache } from '../services/cacheService';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class ResourceRepository extends BaseRepository<
  PrismaClient['resource']
> {
  constructor() {
    super(prisma.resource);
  }

  async getResources(filters?: {
    category?: string;
    type?: string;
    tags?: string[];
    search?: string;
  }) {
    const cacheKey = `resources:${JSON.stringify(filters)}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const resources = await this.findMany({
      where: {
        category: filters?.category,
        type: filters?.type,
        tags: filters?.tags ? { hasEvery: filters.tags } : undefined,
        OR: filters?.search
          ? [
              { title: { contains: filters.search, mode: 'insensitive' } },
              {
                description: { contains: filters.search, mode: 'insensitive' },
              },
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
  }

  async getResource(id: string): Promise<Resource> {
    const cacheKey = `resource:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached as Resource;

    const resource = await this.findUnique({
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
  }

  async updateResource(
    id: string,
    data: {
      title: string;
      content: string;
      images?: Express.Multer.File[];
      userId?: string;
    }
  ): Promise<Resource> {
    const { userId, ...updateData } = data;

    const resource = await this.update({
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
  }

  async deleteResource(id: string): Promise<void> {
    await this.delete({ where: { id } });
    await deleteCache(`resource:${id}`);
    await deleteCache('resources:all');
  }
}
