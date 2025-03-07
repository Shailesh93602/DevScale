import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils/index';
import { paginate } from '../utils/pagination';
import { sendResponse } from '../utils/apiResponse';

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

    return sendResponse(res, 'ROADMAPS_FETCHED', { data: roadmaps });
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
      return sendResponse(res, 'ROADMAP_NOT_FOUND');
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
    return res
      .status(404)
      .json({ success: false, message: 'Roadmap not found' });
  }

  res.status(200).json({ success: true, roadMap });
});

export const createRoadMap = catchAsync(async (req: Request, res: Response) => {
  const user_id = req.user.id;
  const { title, description, content } = req.body;

  if (!title || !description || !content) {
    return res.status(400).json({
      success: false,
      message: 'Title, description, and content are required',
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

  res.status(201).json({ success: true, roadMap: newRoadMap });
});

export const updateRoadMap = catchAsync(async (req: Request, res: Response) => {
  const roadMapId = req.params.id;
  const { title, description } = req.body;

  const roadMap = await prisma.roadmap.findUnique({
    where: { id: roadMapId },
  });

  if (!roadMap) {
    return res
      .status(404)
      .json({ success: false, message: 'Roadmap not found' });
  }

  const updatedRoadMap = await prisma.roadmap.update({
    where: { id: roadMapId },
    data: {
      title: title ?? roadMap.title,
      description: description ?? roadMap.description,
      // content: content ?? roadMap.content,
    },
  });

  res.status(200).json({ success: true, roadMap: updatedRoadMap });
});

export const deleteRoadMap = catchAsync(async (req: Request, res: Response) => {
  const roadMapId = req.params.id;

  const roadMap = await prisma.roadmap.findUnique({
    where: { id: roadMapId },
  });

  if (!roadMap) {
    return res
      .status(404)
      .json({ success: false, message: 'Roadmap not found' });
  }

  await prisma.roadmap.delete({
    where: { id: roadMapId },
  });

  res
    .status(200)
    .json({ success: true, message: 'Roadmap deleted successfully' });
});

export const updateSubjectsOrder = catchAsync(
  async (req: Request, res: Response) => {
    // const { id } = req.params;
    // const { subjectOrders } = req.body;

    // TODO: implement logic to update the order
    // await updateSubjectsOrder(id, subjectOrders);

    res.status(200).json({
      status: 'success',
      message: 'Subject order updated successfully',
    });
  }
);

export const enrollRoadMap = catchAsync(async (req: Request, res: Response) => {
  // TODO: implement logic to use actual user id instead of supabase id
  const userId = req.user.id;
  const { roadmapId } = req.body;

  if (!roadmapId) {
    return sendResponse(res, 'INVALID_ROADMAP_ID');
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
    return sendResponse(res, 'ROADMAP_NOT_FOUND');
  }

  if (roadmap.user_roadmaps.some((ur) => ur.user_id === userId)) {
    return sendResponse(res, 'ROADMAP_ALREADY_ENROLLED');
  }

  await prisma.userRoadmap.create({
    data: {
      user_id: userId,
      roadmap_id: roadmapId,
    },
  });

  return sendResponse(res, 'ROADMAP_ENROLLED');
});
