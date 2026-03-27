import { Request, Response } from 'express';
import { catchAsync } from '../utils/index';
import { sendResponse } from '../utils/apiResponse';
import RoadmapRepository from '../repositories/roadmapRepository';
import { Prisma } from '@prisma/client';
import UserRoadmapRepository from '../repositories/userRoadmapRepository';
import RoadmapCategoryRepository from '../repositories/roadmapCategoryRepository';
import prisma from '../lib/prisma';
import { invalidatePattern, getCached, setCached } from '../services/memoryCache';
import { invalidateCachePattern } from '../services/cacheService';
import { createAppError } from '../utils/errorHandler';
import { assertOwnership } from '../utils/assertOwnership';

export default class RoadmapController {
  private readonly roadmapRepo: RoadmapRepository;
  private readonly userRoadmapRepo: UserRoadmapRepository;
  private readonly roadmapCategoryRepo: RoadmapCategoryRepository;

  constructor() {
    this.roadmapRepo = new RoadmapRepository();
    this.userRoadmapRepo = new UserRoadmapRepository();
    this.roadmapCategoryRepo = new RoadmapCategoryRepository();
  }

  public getAllRoadmaps = catchAsync(async (req: Request, res: Response) => {
    try {
      const { type = 'all' } = req.query;
      const userId = req.user?.id;

      let whereClause: Prisma.RoadmapWhereInput = {
        is_public: true,
      };

      // Apply type filters
      switch (type) {
        case 'featured':
        case 'recommended':
          whereClause = {
            ...whereClause,
            popularity: {
              gt: 100,
            },
          };
          break;
        case 'trending':
          // trending sorting is handled by default by the repository, but we want all public roadmaps
          break;
        case 'my-roadmaps':
          if (userId) {
            whereClause = {
              ...whereClause,
              user_id: userId,
            };
          }
          break;
        case 'enrolled':
          if (userId) {
            whereClause = {
              ...whereClause,
              user_roadmaps: {
                some: {
                  user_id: userId,
                },
              },
            };
          }
          break;
        default:
          // For 'all' type, we keep the default whereClause
          break;
      }

      const roadmaps = await this.roadmapRepo.getAllRoadmaps(req, whereClause);
      return sendResponse(res, 'ROADMAPS_FETCHED', {
        data: roadmaps.data,
        meta: roadmaps.meta
      });
    } catch (error) {
      return sendResponse(res, 'ROADMAP_NOT_FOUND', { error: error as Error });
    }
  });

  public getMainConceptsInRoadmap = catchAsync(
    async (req: Request, res: Response) => {
      const roadmapId = req.params.id;
      const roadmap = await this.roadmapRepo.getRoadmap(roadmapId);

      if (!roadmap) {
        return sendResponse(res, 'ROADMAP_NOT_FOUND', {
          error: 'Roadmap not found',
        });
      }

      return sendResponse(res, 'MAIN_CONCEPTS_FETCHED', {
        data: roadmap.main_concepts,
      });
    }
  );

  public getRoadMap = catchAsync(async (req: Request, res: Response) => {
    const roadMapId = req.params.id;
    const userId = req.user?.id;

    const roadMap = await this.roadmapRepo.getRoadmap(roadMapId, userId);

    if (!roadMap) {
      return sendResponse(res, 'ROADMAP_NOT_FOUND', {
        error: 'Roadmap not found',
      });
    }

    sendResponse(res, 'ROADMAP_FETCHED', { data: roadMap });
  });

  public createRoadmap = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 'UNAUTHORIZED', {
        error: 'User not authenticated',
      });
    }

    const userId = req.user.id;

    const {
      title,
      description,
      categoryId,
      difficulty,
      estimatedHours,
      isPublic,
      version,
      tags = [],
      mainConcepts = [],
    } = req.body;

    // Map frontend difficulty values to Prisma enum
    const difficultyMap: Record<string, any> = {
      'BEGINNER': 'EASY',
      'INTERMEDIATE': 'MEDIUM',
      'ADVANCED': 'HARD',
    };
    const prismaDifficulty = difficultyMap[difficulty?.toUpperCase()] || difficulty;

    const createInput: Prisma.RoadmapCreateInput = {
      title,
      description,
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      difficulty: prismaDifficulty,
      estimatedHours,
      is_public: isPublic,
      version,
      tags: Array.isArray(tags) ? tags.join(',') : '',
      user: {
        connect: { id: userId },
      },
      main_concepts: {
        create: mainConcepts.map(
          (concept: { main_concept_id: string }, index: number) => ({
            order: index,
            main_concept: {
              connect: { id: concept.main_concept_id },
            },
          })
        ),
      },
      topics: {
        create: mainConcepts.flatMap(
          (
            concept: { subjects: { topics: { topic_id: string }[] }[] },
            conceptIndex: number
          ) =>
            concept.subjects.flatMap((subject, subjectIndex) =>
              subject.topics.map((topic, topicIndex) => ({
                topic: {
                  connect: { id: topic.topic_id },
                },
                order: conceptIndex * 1000 + subjectIndex * 100 + topicIndex,
              }))
            )
        ),
      },
    };

    const roadmap = await this.roadmapRepo.create({
      data: createInput,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
        main_concepts: {
          include: {
            main_concept: true,
          },
        },
        topics: {
          include: {
            topic: true,
          },
        },
      },
    });

    return sendResponse(res, 'ROADMAP_CREATED', {
      data: roadmap,
    });
  });

  public updateRoadMap = catchAsync(async (req: Request, res: Response) => {
    const roadMapId = req.params.id;
    const { title, description } = req.body;

    const roadMap = await this.roadmapRepo.getRoadmap(roadMapId);

    if (!roadMap) {
      return sendResponse(res, 'ROADMAP_NOT_FOUND', {
        error: 'Roadmap not found',
      });
    }

    if (assertOwnership(req, res, (roadMap as { user_id?: string }).user_id)) return;

    const updatedRoadMap = await this.roadmapRepo.update({
      where: { id: roadMap.id },
      data: {
        title: title ?? roadMap.title,
        description: description ?? roadMap.description,
      },
    });

    return sendResponse(res, 'ROADMAP_UPDATED', {
      data: updatedRoadMap,
    });
  });

  public deleteRoadMap = catchAsync(async (req: Request, res: Response) => {
    const roadMapId = req.params.id;

    const roadMap = await this.roadmapRepo.getRoadmap(roadMapId);

    if (!roadMap) {
      return sendResponse(res, 'ROADMAP_NOT_FOUND', {
        error: 'Roadmap not found',
      });
    }

    if (assertOwnership(req, res, (roadMap as { user_id?: string }).user_id)) return;

    await this.roadmapRepo.delete({
      where: { id: roadMap.id },
    });

    return sendResponse(res, 'ROADMAP_DELETED', {
      data: { id: roadMap.id },
    });
  });

  public updateSubjectsOrder = catchAsync(
    async (req: Request, res: Response) => {
      return sendResponse(res, 'SUBJECT_ORDER_UPDATED', {
        data: null,
      });
    }
  );

  public enrollRoadMap = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 'UNAUTHORIZED', {
        error: 'User not authenticated',
      });
    }

    const userId = req.user.id;
    const { roadmapId } = req.body;

    if (!roadmapId) {
      return sendResponse(res, 'INVALID_ROADMAP_ID', {
        error: 'Invalid roadmap ID',
      });
    }

    const roadmap = await this.roadmapRepo.getUserRoadmap(roadmapId, userId);

    if (!roadmap) {
      return sendResponse(res, 'ROADMAP_NOT_FOUND', {
        error: 'Roadmap not found',
      });
    }

    if (roadmap.user_roadmaps.some((ur) => ur.user_id === userId)) {
      // Invalidate caches even for already-enrolled users so fresh page loads reflect enrollment
      invalidatePattern(`roadmap:detail:${roadmapId}`);
      await invalidateCachePattern(`roadmap:detail:${roadmapId}:${userId}`);
      return sendResponse(res, 'ROADMAP_ALREADY_ENROLLED', {
        data: { isEnrolled: true },
      });
    }

    await this.userRoadmapRepo.create({
      data: {
        user_id: userId,
        roadmap_id: roadmapId,
      },
    });

    invalidatePattern(`roadmap:detail:${roadmapId}`);
    invalidatePattern(`roadmaps:list:${userId}`); // Invalidate user's list cache
    await invalidateCachePattern(`roadmap:detail:${roadmapId}:${userId}`);

    return sendResponse(res, 'ROADMAP_ENROLLED', { data: null });
  });

  public getRoadmapCategories = catchAsync(
    async (req: Request, res: Response) => {
      const CATEGORIES_CACHE_KEY = 'roadmaps:categories:all';
      let categories = getCached<any[]>(CATEGORIES_CACHE_KEY);
      if (!categories) {
        categories = await this.roadmapCategoryRepo.findMany();
        setCached(CATEGORIES_CACHE_KEY, categories, 10 * 60); // 10 minutes
      }
      return sendResponse(res, 'ROADMAP_CATEGORIES_FETCHED', {
        data: categories,
      });
    }
  );

  public likeRoadmap = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 'UNAUTHORIZED', {
        error: 'User not authenticated',
      });
    }

    const userId = req.user.id;
    const roadmapId = req.params.id;

    // Lightweight existence check — avoid full getRoadmap() query
    const roadmapExists = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      select: { id: true },
    });
    if (!roadmapExists) {
      return sendResponse(res, 'ROADMAP_NOT_FOUND', {
        error: 'Roadmap not found',
      });
    }

    const existingLike = await prisma.like.findFirst({
      where: { user_id: userId, roadmap_id: roadmapId },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      invalidatePattern(`roadmap:detail:${roadmapId}`);
      return sendResponse(res, 'ROADMAP_UNLIKED', { data: null });
    }

    await prisma.like.create({ data: { user_id: userId, roadmap_id: roadmapId } });
    invalidatePattern(`roadmap:detail:${roadmapId}`);
    return sendResponse(res, 'ROADMAP_LIKED', { data: null });
  });

  public bookmarkRoadmap = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 'UNAUTHORIZED', {
        error: 'User not authenticated',
      });
    }

    const userId = req.user.id;
    const roadmapId = req.params.id;

    const existingBookmark = await prisma.userRoadmap.findFirst({
      where: {
        user_id: userId,
        roadmap_id: roadmapId,
      },
    });

    if (existingBookmark) {
      await prisma.userRoadmap.delete({
        where: {
          id: existingBookmark.id,
        },
      });
      invalidatePattern(`roadmap:detail:${roadmapId}`);
      return sendResponse(res, 'ROADMAP_UNBOOKMARKED', { data: null });
    }

    await prisma.userRoadmap.create({
      data: {
        user_id: userId,
        roadmap_id: roadmapId,
      },
    });

    invalidatePattern(`roadmap:detail:${roadmapId}`);
    return sendResponse(res, 'ROADMAP_BOOKMARKED', { data: null });
  });

  public getRoadmapComments = catchAsync(
    async (req: Request, res: Response) => {
      const { id: roadmapId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user?.id;

      const { data: comments, meta } =
        await this.roadmapRepo.getRoadmapComments(
          roadmapId,
          Number(page),
          Number(limit)
        );

      // Batch: collect all comment + reply IDs, then fetch likes in ONE query
      const allCommentIds = comments.flatMap((c) => [
        c.id,
        ...(c.replies || []).map((r: { id: string }) => r.id),
      ]);

      const likedSet = new Set<string>();
      if (userId && allCommentIds.length > 0) {
        const likedComments = await prisma.like.findMany({
          where: { user_id: userId, comment_id: { in: allCommentIds } },
          select: { comment_id: true },
        });
        likedComments.forEach((l) => {
          if (l.comment_id) likedSet.add(l.comment_id);
        });
      }

      const commentsWithLikes = comments.map((comment) => ({
        ...comment,
        isLiked: likedSet.has(comment.id),
        replies: (comment.replies || []).map((reply: { id: string }) => ({
          ...reply,
          isLiked: likedSet.has(reply.id),
        })),
      }));

      return sendResponse(res, 'COMMENTS_FETCHED', {
        data: commentsWithLikes,
        meta,
      });
    }
  );

  public addComment = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 'UNAUTHORIZED', {
        error: 'User not authenticated',
      });
    }

    const { id: roadmapId } = req.params;
    const { content, parent_id } = req.body;
    const userId = req.user.id;

    const comment = await this.roadmapRepo.addComment({
      content,
      user_id: userId,
      roadmap_id: roadmapId,
      parent_id,
    });

    return sendResponse(res, 'COMMENT_ADDED', {
      data: {
        ...comment,
        isLiked: false,
      },
    });
  });

  public toggleCommentLike = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 'UNAUTHORIZED', {
        error: 'User not authenticated',
      });
    }

    const { commentId } = req.params;
    const userId = req.user.id;

    const existingLike = await prisma.like.findFirst({
      where: {
        user_id: userId,
        comment_id: commentId,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          user_id: userId,
          comment_id: commentId,
        },
      });
    }

    // Get updated comment data
    const updatedComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
                avatar_url: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    if (!updatedComment) {
      throw createAppError('Comment not found', 404);
    }

    // Check if the user has liked the comment
    const isLiked = await prisma.like.findFirst({
      where: {
        user_id: userId,
        comment_id: commentId,
      },
    });

    return sendResponse(
      res,
      existingLike ? 'COMMENT_UNLIKED' : 'COMMENT_LIKED',
      {
        data: {
          ...updatedComment,
          isLiked: Boolean(isLiked),
        },
      }
    );
  });
}
