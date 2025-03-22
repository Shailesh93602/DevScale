import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils/index';
import { sendResponse } from '../utils/apiResponse';

// Get all main concepts
export const getAllMainConcepts = catchAsync(
  async (req: Request, res: Response) => {
    const mainConcepts = await prisma.mainConcept.findMany({
      include: {
        subjects: {
          include: {
            subject: {
              select: {
                title: true,
                description: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return sendResponse(res, 'MAIN_CONCEPTS_FETCHED', {
      data: mainConcepts,
    });
  }
);

// Get a single main concept by ID
export const getMainConceptById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const mainConcept = await prisma.mainConcept.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            subject: {
              select: {
                title: true,
                description: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!mainConcept) {
      return sendResponse(res, 'MAIN_CONCEPT_NOT_FOUND', {
        error: 'Main concept not found',
      });
    }

    return sendResponse(res, 'MAIN_CONCEPT_FETCHED', {
      data: mainConcept,
    });
  }
);

// Create a new main concept
export const createMainConcept = catchAsync(
  async (req: Request, res: Response) => {
    const { name, description, order, roadmapId } = req.body;

    const mainConcept = await prisma.mainConcept.create({
      data: {
        name,
        description,
        order: order || 0,
        roadmaps: {
          connect: { id: roadmapId },
        },
      },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    return sendResponse(res, 'MAIN_CONCEPT_CREATED', {
      data: mainConcept,
    });
  }
);

// Update a main concept
export const updateMainConcept = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, order } = req.body;

    const mainConcept = await prisma.mainConcept.findUnique({
      where: { id },
    });

    if (!mainConcept) {
      return sendResponse(res, 'MAIN_CONCEPT_NOT_FOUND', {
        error: 'Main concept not found',
      });
    }

    const updatedMainConcept = await prisma.mainConcept.update({
      where: { id },
      data: {
        name,
        description,
        order: order || mainConcept.order,
      },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    return sendResponse(res, 'MAIN_CONCEPT_UPDATED', {
      data: updatedMainConcept,
    });
  }
);

// Delete a main concept
export const deleteMainConcept = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const mainConcept = await prisma.mainConcept.findUnique({
      where: { id },
    });

    if (!mainConcept) {
      return sendResponse(res, 'MAIN_CONCEPT_NOT_FOUND', {
        error: 'Main concept not found',
      });
    }

    await prisma.mainConcept.delete({
      where: { id },
    });

    return sendResponse(res, 'MAIN_CONCEPT_DELETED', {
      data: { id },
    });
  }
);

// Get subjects in a main concept
export const getSubjectsInMainConcept = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const mainConcept = await prisma.mainConcept.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            subject: {
              select: {
                title: true,
                description: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!mainConcept) {
      return sendResponse(res, 'MAIN_CONCEPT_NOT_FOUND', {
        error: 'Main concept not found',
      });
    }

    return sendResponse(res, 'SUBJECTS_FETCHED', {
      data: mainConcept.subjects,
    });
  }
);
