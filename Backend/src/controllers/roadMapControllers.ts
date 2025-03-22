import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils/index';
import { paginate } from '../utils/pagination';
import { sendResponse } from '../utils/apiResponse';
import { Difficulty, Prisma } from '@prisma/client';

interface RoadmapTopic {
  topic_id: string;
  order: number;
}

interface RoadmapSubject {
  subject_id: string;
  order: number;
  topics: RoadmapTopic[];
}

interface RoadmapMainConcept {
  main_concept_id: string;
  order: number;
  subjects: RoadmapSubject[];
}

interface CreateRoadmapBody {
  title: string;
  description: string;
  categoryId: string;
  difficulty: Difficulty;
  estimatedHours: number;
  isPublic: boolean;
  version: string;
  tags: string[];
  mainConcepts: RoadmapMainConcept[];
}

export const getAllRoadmaps = catchAsync(
  async (req: Request, res: Response) => {
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
            // is_public: true,
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

    const roadmaps = await paginate({
      req,
      model: prisma.roadmap,
      searchFields: ['title', 'description'],
      whereClause: whereClause.where, // Pass only the where conditions
      selection: {
        include: {
          user: {
            select: {
              id: true,
              username: true, // Changed from 'name' to 'username'
              full_name: true, // Added full_name as an option
            },
          },
        },
      },
    });

    return sendResponse(res, 'ROADMAPS_FETCHED', {
      data: roadmaps,
    });
  }
);

export const getMainConceptsInRoadmap = catchAsync(
  async (req: Request, res: Response) => {
    const roadmapId = req.params.id;
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        main_concepts: {
          select: {
            main_concept: {
              select: {
                id: true,
                name: true,
                description: true,
                subjects: {
                  select: {
                    subject: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                  },
                  orderBy: {
                    created_at: 'asc',
                  },
                },
              },
            },
          },
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    });

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

export const getRoadMap = catchAsync(async (req: Request, res: Response) => {
  const roadMapId = req.params.id;
  const roadMap = await prisma.roadmap.findUnique({
    where: { id: roadMapId },
  });

  if (!roadMap) {
    return sendResponse(res, 'ROADMAP_NOT_FOUND', {
      error: 'Roadmap not found',
    });
  }

  sendResponse(res, 'ROADMAP_FETCHED', { data: { roadMap } });
});

export const createRoadMap = catchAsync(async (req: Request, res: Response) => {
  const user_id = req.user.id;
  const { title, description, content } = req.body;

  if (!title || !description || !content) {
    return sendResponse(res, 'INVALID_PAYLOAD', {
      error: 'Invalid payload',
    });
  }

  const newRoadMap = await prisma.roadmap.create({
    data: {
      title,
      description,
      // content,
      user_id,
    },
  });

  sendResponse(res, 'ROADMAP_CREATED', { data: newRoadMap });
});

export const createRoadmap = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return sendResponse(res, 'UNAUTHORIZED', {
      error: 'User not authenticated',
    });
  }

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
  } = req.body as CreateRoadmapBody;

  const createInput: Prisma.RoadmapCreateInput = {
    title,
    description,
    category: categoryId ? { connect: { id: categoryId } } : undefined,
    difficulty,
    estimatedHours,
    is_public: isPublic,
    version,
    tags: tags.join(','), // Convert array to comma-separated string
    user: {
      connect: { id: userId },
    },
    main_concepts: {
      create: mainConcepts.map((concept, index) => ({
        order: index,
        main_concept: {
          connect: { id: concept.main_concept_id },
        },
      })),
    },
    topics: {
      create: mainConcepts.flatMap((concept, conceptIndex) =>
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

  // Create the roadmap
  const roadmap = await prisma.roadmap.create({
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

export const updateRoadMap = catchAsync(async (req: Request, res: Response) => {
  const roadMapId = req.params.id;
  const { title, description } = req.body;

  const roadMap = await prisma.roadmap.findUnique({
    where: { id: roadMapId },
  });

  if (!roadMap) {
    return sendResponse(res, 'ROADMAP_NOT_FOUND', {
      error: 'Roadmap not found',
    });
  }

  const updatedRoadMap = await prisma.roadmap.update({
    where: { id: roadMapId },
    data: {
      title: title ?? roadMap.title,
      description: description ?? roadMap.description,
      // content: content ?? roadMap.content,
    },
  });

  return sendResponse(res, 'ROADMAP_UPDATED', {
    data: updatedRoadMap,
  });
});

export const deleteRoadMap = catchAsync(async (req: Request, res: Response) => {
  const roadMapId = req.params.id;

  const roadMap = await prisma.roadmap.findUnique({
    where: { id: roadMapId },
  });

  if (!roadMap) {
    return sendResponse(res, 'ROADMAP_NOT_FOUND', {
      error: 'Roadmap not found',
    });
  }

  await prisma.roadmap.delete({
    where: { id: roadMapId },
  });

  return sendResponse(res, 'ROADMAP_DELETED', {
    data: { id: roadMapId },
  });
});

export const updateSubjectsOrder = catchAsync(
  async (req: Request, res: Response) => {
    // TODO: implement logic to update the order
    return sendResponse(res, 'SUBJECT_ORDER_UPDATED', {
      data: null,
    });
  }
);

export const enrollRoadMap = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { roadmapId } = req.body;

  if (!roadmapId) {
    return sendResponse(res, 'INVALID_ROADMAP_ID', {
      error: 'Invalid roadmap ID',
    });
  }

  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    include: {
      user_roadmaps: {
        where: { user_id: userId },
      },
    },
  });

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

  await prisma.userRoadmap.create({
    data: {
      user_id: userId,
      roadmap_id: roadmapId,
    },
  });

  return sendResponse(res, 'ROADMAP_ENROLLED', { data: null });
});

export const getRoadmapCategories = catchAsync(
  async (req: Request, res: Response) => {
    const categories = await prisma.roadmapCategory.findMany();
    return sendResponse(res, 'ROADMAP_CATEGORIES_FETCHED', {
      data: categories,
    });
  }
);
