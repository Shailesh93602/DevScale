import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils/index';

export const getAllRoadmaps = catchAsync(
  async (req: Request, res: Response) => {
    const roadmaps = await prisma.roadmap.findMany({
      include: {
        mainConcepts: {
          select: {
            id: true,
            name: true,
            description: true,
          },
          orderBy: {
            created_at: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    res.status(200).json(roadmaps);
  }
);

export const getMainConceptsInRoadmap = catchAsync(
  async (req: Request, res: Response) => {
    const roadmapId = req.params.id;
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        mainConcepts: {
          select: {
            id: true,
            name: true,
            description: true,
            subjects: {
              select: {
                id: true,
                title: true,
              },
              orderBy: {
                created_at: 'asc',
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
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    res.status(200).json(roadmap.mainConcepts);
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
  const userId = req.user.id;
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
      userId,
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
