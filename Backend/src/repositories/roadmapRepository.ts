import { Prisma } from '@prisma/client';
import type { Roadmap } from '@prisma/client';
import { Request } from 'express';
import { createAppError } from '../middlewares/errorHandler.js';
import { getCache, setCache } from '../services/cacheService.js';
import BaseRepository from './baseRepository.js';
import prisma from '../lib/prisma.js';
import { isUuid } from '../utils/slugify.js';
import { CommentData } from '../types/index.js';
import { fetchConceptTree } from './roadmap/conceptTree.js';
import {
  calculateUserProgress,
  formatRoadmapResponse,
  getRoadmapSortOptions,
  parseRoadmapListQuery,
} from './roadmap/listing.js';
import {
  authorSelect,
  commentThreadInclude,
  roadmapCountSelect,
  roadmapViewFields,
  viewerRelations,
  type RoadmapListItem,
} from './roadmap/roadmapShapes.js';

const commentCount = { select: { likes: true, replies: true } } as const;

export default class RoadmapRepository extends BaseRepository<
  Roadmap,
  typeof prisma.roadmap
> {
  constructor() {
    super(prisma.roadmap);
  }

  /** Resolves a slug or UUID to a canonical UUID. Throws 404 if not found. */
  private async resolveRoadmapId(idOrSlug: string): Promise<string> {
    if (isUuid(idOrSlug)) return idOrSlug;
    const row = await this.prismaClient.roadmap.findUnique({
      where: { slug: idOrSlug },
      select: { id: true },
    });
    if (!row) throw createAppError('Roadmap not found', 404);
    return row.id;
  }

  async getRoadmap(idOrSlug: string, userId?: string) {
    const id = await this.resolveRoadmapId(idOrSlug);
    const cacheKey = `roadmap:detail:${id}:${userId || 'anon'}`;
    const cached = await getCache<unknown>(cacheKey);
    if (cached) return cached;

    // Flat roadmap info, the nested concept tree and the viewer's progress, in parallel.
    const [roadmap, conceptsResult, userProgress] = await Promise.all([
      this.prismaClient.roadmap.findUnique({
        where: { id },
        include: {
          user: { select: authorSelect },
          category: { select: { id: true, name: true } },
          _count: roadmapCountSelect,
          ...viewerRelations(userId),
        },
      }),
      fetchConceptTree(id),
      userId
        ? this.prismaClient.userProgress.findMany({
            where: {
              user_id: userId,
              topic: { roadmaps: { some: { roadmap_id: id } } },
            },
            select: { is_completed: true },
          })
        : Promise.resolve([]),
    ]);

    if (!roadmap) {
      throw createAppError('Roadmap not found', 404);
    }

    let progress = 0;
    if (userId && roadmap.user_roadmaps && roadmap.user_roadmaps.length > 0) {
      const completedTopics = userProgress.filter((p) => p.is_completed).length;
      progress =
        roadmap._count.topics > 0
          ? Math.round((completedTopics / roadmap._count.topics) * 100)
          : 0;
    }

    const result = {
      ...roadmap,
      main_concepts: conceptsResult[0]?.main_concepts || [],
      ...roadmapViewFields(roadmap, progress),
    };

    await setCache(cacheKey, result, { ttl: 86400 }); // 24h — roadmap metadata rarely changes
    return result;
  }

  async getUserRoadmap(id: string, user_id: string) {
    const roadmap = await this.prismaClient.roadmap.findUnique({
      where: { id },
      include: { user_roadmaps: { where: { user_id } } },
    });

    if (!roadmap) {
      throw createAppError('Roadmap not found', 404);
    }

    return roadmap;
  }

  async getAllRoadmaps(req: Request, where?: Prisma.RoadmapWhereInput) {
    const { limit, page, search, category, difficulty, sort, userId } =
      parseRoadmapListQuery(req);

    const cacheKey = `roadmaps:list:${userId || 'guest'}:${sort}:${page}:${limit}:${search}:${category || ''}:${difficulty || ''}:${JSON.stringify(where || {})}`;
    const cached = await getCache<{
      data: unknown[];
      meta: Record<string, unknown>;
    }>(cacheKey);
    if (cached) return cached;

    const combinedWhere: Prisma.RoadmapWhereInput = {
      ...where,
      ...(category ? { category_id: { in: category.split(',') } } : {}),
      ...(difficulty
        ? { difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD' }
        : {}),
    };

    const topicsInclude = userId
      ? { topics: { select: { topic: { select: { id: true, title: true } } } } }
      : {};

    const roadmaps = (await this.paginate(
      { limit, page, search, sort: getRoadmapSortOptions(sort) },
      ['title'],
      {
        include: {
          user: { select: authorSelect },
          category: { select: { id: true, name: true } },
          ...topicsInclude,
          _count: roadmapCountSelect,
          ...viewerRelations(userId),
        },
      },
      combinedWhere
    )) as unknown as { data: RoadmapListItem[]; meta: Record<string, unknown> };

    const userProgressMap = await calculateUserProgress(userId, roadmaps.data);

    const result = {
      ...roadmaps,
      data: roadmaps.data.map((roadmap: RoadmapListItem) =>
        formatRoadmapResponse(roadmap, userProgressMap[roadmap.id] || 0)
      ),
    };

    await setCache(cacheKey, result, { ttl: userId ? 300 : 86400 });
    return result;
  }

  async addComment(data: CommentData) {
    return this.prismaClient.comment.create({
      data: {
        content: data.content,
        user_id: data.user_id,
        roadmap_id: data.roadmap_id,
        parent_id: data.parent_id,
      },
      include: {
        user: { select: authorSelect },
        replies: { include: { user: { select: authorSelect } } },
        _count: commentCount,
      },
    });
  }

  async getRoadmapComments(roadmap_id: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = { roadmap_id, parent_id: null };
    const [total, comments] = await Promise.all([
      this.prismaClient.comment.count({ where }),
      this.prismaClient.comment.findMany({
        where,
        include: commentThreadInclude,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: comments,
      meta: {
        total,
        currentPage: page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
