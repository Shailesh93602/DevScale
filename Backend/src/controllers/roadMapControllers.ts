import { Request, Response } from 'express';
import { catchAsync } from '../utils/index.js';
import { sendResponse } from '../utils/apiResponse.js';
import RoadmapRepository from '../repositories/roadmapRepository.js';
import { RoadmapCategory } from '@prisma/client';
import UserRoadmapRepository from '../repositories/userRoadmapRepository.js';
import RoadmapCategoryRepository from '../repositories/roadmapCategoryRepository.js';
import prisma from '../lib/prisma.js';
import {
  invalidatePattern,
  getCached,
  setCached,
} from '../services/memoryCache.js';
import { invalidateCachePattern } from '../services/cacheService.js';
import { createAppError } from '../utils/errorHandler.js';
import { assertOwnership } from '../utils/assertOwnership.js';
import { commentThreadInclude } from '../repositories/roadmap/roadmapShapes.js';
import {
  buildRoadmapCreateInput,
  buildRoadmapListWhere,
} from './roadmap/roadmapInputs.js';
import {
  getLikedCommentIds,
  invalidateRoadmapCaches,
  toggleCommentLikeRow,
  toggleRoadmapBookmark,
  toggleRoadmapLike,
} from './roadmap/roadmapEngagement.js';

interface RoadmapDetail {
  id: string;
  title: string;
  description: string;
  user_id: string;
  main_concepts: unknown[];
}

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
      const whereClause = buildRoadmapListWhere(type, req.user?.id);

      const roadmaps = await this.roadmapRepo.getAllRoadmaps(req, whereClause);
      return sendResponse(res, 'ROADMAPS_FETCHED', {
        data: roadmaps.data,
        meta: roadmaps.meta,
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
        data: (roadmap as RoadmapDetail).main_concepts,
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

    const createInput = buildRoadmapCreateInput(req.body, req.user.id);

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

    const roadMap = (await this.roadmapRepo.getRoadmap(
      roadMapId
    )) as RoadmapDetail | null;

    if (!roadMap) {
      return sendResponse(res, 'ROADMAP_NOT_FOUND', {
        error: 'Roadmap not found',
      });
    }

    if (assertOwnership(req, res, roadMap.user_id)) return;

    const updatedRoadMap = await this.roadmapRepo.update({
      where: { id: roadMap.id },
      data: {
        title: title ?? roadMap.title,
        description: description ?? roadMap.description,
      },
    });
    await invalidateRoadmapCaches(roadMap.id, { lists: true });

    return sendResponse(res, 'ROADMAP_UPDATED', {
      data: updatedRoadMap,
    });
  });

  public deleteRoadMap = catchAsync(async (req: Request, res: Response) => {
    const roadMapId = req.params.id;

    const roadMap = (await this.roadmapRepo.getRoadmap(
      roadMapId
    )) as RoadmapDetail | null;

    if (!roadMap) {
      return sendResponse(res, 'ROADMAP_NOT_FOUND', {
        error: 'Roadmap not found',
      });
    }

    if (assertOwnership(req, res, roadMap.user_id)) return;

    await this.roadmapRepo.delete({
      where: { id: roadMap.id },
    });
    await invalidateRoadmapCaches(roadMap.id, { lists: true });

    return sendResponse(res, 'ROADMAP_DELETED', {
      data: { id: roadMap.id },
    });
  });

  /*
   * REMOVED 2026-09-20: `PATCH /roadmaps/:id/subjects-order`.
   *
   * The endpoint answered `200 SUBJECT_ORDER_UPDATED — "Subject order updated
   * successfully"` and wrote nothing. Its controller was, in full:
   *
   *     public updateSubjectsOrder = catchAsync(async (req, res) => {
   *       return sendResponse(res, 'SUBJECT_ORDER_UPDATED', { data: null });
   *     });
   *
   * It had been that way since the initial commit, had no caller anywhere in the
   * repo or the frontend, and no test.
   *
   * IT WAS NOT WIRED UP INSTEAD, and that is the part worth recording.
   * `roadmapRepository.updateSubjectsOrder(roadmap_id, subject_orders)` existed
   * and looked like the missing call — but it accepted `roadmap_id` and never
   * used it:
   *
   *     this.prismaClient.mainConceptSubject.updateMany({
   *       where: { subject_id: order.subject_id },
   *       data:  { order: order.order },
   *     })
   *
   * `MainConceptSubject` is keyed `(main_concept_id, subject_id)` and main
   * concepts are shared between roadmaps, so that `updateMany` reorders the
   * subject in EVERY main concept in EVERY roadmap that contains it. Calling it
   * would have turned a harmless lie into silent cross-roadmap data corruption
   * triggered by a UI a moderator would reasonably expect to be local.
   *
   * The two halves did not even agree on a wire format: the Joi schema took
   * `subjectOrders: [{ subjectId, order }]` while the repository expected
   * `subject_orders: [{ subject_id, order }]`.
   *
   * So the whole feature is removed rather than half-connected. Reinstating it
   * needs a decision this cleanup cannot make for anyone: what "a subject's
   * order within THIS roadmap" means when the join row is shared — scope the
   * update through `RoadmapMainConcept`, or give the roadmap its own ordering
   * row. Until that is settled there is nothing honest to return.
   */

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
    invalidatePattern(`roadmaps:list:${userId}`);
    invalidatePattern(`dashboard:summary:${userId}`); // Ensure dashboard shows new enrollment
    await invalidateCachePattern(`roadmap:detail:${roadmapId}:${userId}`);

    return sendResponse(res, 'ROADMAP_ENROLLED', { data: null });
  });

  public getRoadmapCategories = catchAsync(
    async (req: Request, res: Response) => {
      const CATEGORIES_CACHE_KEY = 'roadmaps:categories:all';
      let categories = getCached<RoadmapCategory[]>(CATEGORIES_CACHE_KEY);
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

    const outcome = await toggleRoadmapLike(req.user.id, req.params.id);
    if (!outcome) {
      return sendResponse(res, 'ROADMAP_NOT_FOUND', {
        error: 'Roadmap not found',
      });
    }
    return sendResponse(
      res,
      outcome === 'unliked' ? 'ROADMAP_UNLIKED' : 'ROADMAP_LIKED',
      { data: null }
    );
  });

  public bookmarkRoadmap = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 'UNAUTHORIZED', {
        error: 'User not authenticated',
      });
    }

    const outcome = await toggleRoadmapBookmark(req.user.id, req.params.id);
    if (!outcome) {
      return sendResponse(res, 'ROADMAP_NOT_FOUND', {
        error: 'Roadmap not found',
      });
    }
    return sendResponse(
      res,
      outcome === 'unbookmarked'
        ? 'ROADMAP_UNBOOKMARKED'
        : 'ROADMAP_BOOKMARKED',
      { data: null }
    );
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

      const likedSet = await getLikedCommentIds(
        userId,
        comments.flatMap((c) => [c.id, ...(c.replies || []).map((r) => r.id)])
      );

      const commentsWithLikes = comments.map((comment) => ({
        ...comment,
        isLiked: likedSet.has(comment.id),
        replies: (comment.replies || []).map((reply) => ({
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

    const wasLiked = await toggleCommentLikeRow(userId, commentId);

    // Get updated comment data
    const updatedComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: commentThreadInclude,
    });

    if (!updatedComment) {
      throw createAppError('Comment not found', 404);
    }

    // Check if the user has liked the comment
    const isLiked = await prisma.like.findFirst({
      where: { user_id: userId, comment_id: commentId },
    });

    return sendResponse(res, wasLiked ? 'COMMENT_UNLIKED' : 'COMMENT_LIKED', {
      data: {
        ...updatedComment,
        isLiked: Boolean(isLiked),
      },
    });
  });
}
