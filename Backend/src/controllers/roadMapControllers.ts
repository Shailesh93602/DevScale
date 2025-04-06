import { Request, Response } from 'express';
import { catchAsync } from '../utils/index';
import { sendResponse } from '../utils/apiResponse';
import RoadmapRepository from '../repositories/roadmapRepository';
import { Prisma } from '@prisma/client';
import UserRoadmapRepository from '@/repositories/userRoadmapRepository';
import RoadmapCategoryRepository from '@/repositories/roadmapCategoryRepository';
import prisma from '@/lib/prisma';
import { createAppError } from '@/utils/errorHandler';

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
    const { type } = req.query;
    const userId = req.user?.id;

    const whereClause: {
      where?: {
        user_id?: string | { not: string };
        user_roadmaps?: {
          none?: { user_id: string };
          some?: { user_id: string };
        };
        is_public?: boolean;
      };
    } = {};

    if (userId) {
      switch (type) {
        case 'featured':
          whereClause.where = {
            user_id: { not: userId },
            user_roadmaps: {
              none: { user_id: userId },
            },
          };
          break;
        case 'my-roadmaps':
          whereClause.where = {
            user_id: userId,
          };
          break;
        case 'enrolled':
          whereClause.where = {
            user_roadmaps: {
              some: { user_id: userId },
            },
          };
          break;
      }
    }

    const roadmaps = await this.roadmapRepo.getAllRoadmaps(
      req,
      whereClause.where
    );

    return sendResponse(res, 'ROADMAPS_FETCHED', {
      data: roadmaps,
    });
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

    sendResponse(res, 'ROADMAP_FETCHED', { data: { roadMap } });
  });

  public createRoadMap = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 'UNAUTHORIZED', {
        error: 'User not authenticated',
      });
    }

    const user_id = req.user.id;
    const { title, description, content } = req.body;

    if (!title || !description || !content) {
      return sendResponse(res, 'INVALID_PAYLOAD', {
        error: 'Invalid payload',
      });
    }

    const newRoadMap = await this.roadmapRepo.createRoadmap({
      title,
      description,
      author_id: user_id,
    });

    sendResponse(res, 'ROADMAP_CREATED', { data: newRoadMap });
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
      tags,
      mainConcepts,
    } = req.body;

    const createInput: Prisma.RoadmapCreateInput = {
      title,
      description,
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      difficulty,
      estimatedHours,
      is_public: isPublic,
      version,
      tags: tags.join(','),
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
            full_name: true,
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

    const updatedRoadMap = await this.roadmapRepo.update({
      where: { id: roadMapId },
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

    await this.roadmapRepo.delete({
      where: { id: roadMapId },
    });

    return sendResponse(res, 'ROADMAP_DELETED', {
      data: { id: roadMapId },
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
      return sendResponse(res, 'ROADMAP_ALREADY_ENROLLED', {
        error: 'Already enrolled',
      });
    }

    await this.userRoadmapRepo.create({
      data: {
        user_id: userId,
        roadmap_id: roadmapId,
      },
    });

    return sendResponse(res, 'ROADMAP_ENROLLED', { data: null });
  });

  public getRoadmapCategories = catchAsync(
    async (req: Request, res: Response) => {
      const categories = await this.roadmapCategoryRepo.findMany();
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

    // Check if roadmap exists
    const roadmap = await this.roadmapRepo.getRoadmap(roadmapId);
    if (!roadmap) {
      return sendResponse(res, 'ROADMAP_NOT_FOUND', {
        error: 'Roadmap not found',
      });
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        user_id: userId,
        roadmap_id: roadmapId,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      return sendResponse(res, 'ROADMAP_UNLIKED', { data: null });
    }

    await prisma.like.create({
      data: {
        user_id: userId,
        roadmap_id: roadmapId,
      },
    });

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
      return sendResponse(res, 'ROADMAP_UNBOOKMARKED', { data: null });
    }

    await prisma.userRoadmap.create({
      data: {
        user_id: userId,
        roadmap_id: roadmapId,
      },
    });

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

      // Add isLiked field to each comment and its replies
      const commentsWithLikes = await Promise.all(
        comments.map(async (comment) => {
          const [commentIsLiked, repliesWithLikes] = await Promise.all([
            userId
              ? prisma.like.findFirst({
                  where: {
                    user_id: userId,
                    comment_id: comment.id,
                  },
                })
              : Promise.resolve(false),
            Promise.all(
              (comment.replies || []).map(async (reply) => {
                const replyIsLiked = userId
                  ? await prisma.like.findFirst({
                      where: {
                        user_id: userId,
                        comment_id: reply.id,
                      },
                    })
                  : false;

                return {
                  ...reply,
                  isLiked: Boolean(replyIsLiked),
                };
              })
            ),
          ]);

          return {
            ...comment,
            isLiked: Boolean(commentIsLiked),
            replies: repliesWithLikes,
          };
        })
      );

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
            full_name: true,
            avatar_url: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                full_name: true,
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
