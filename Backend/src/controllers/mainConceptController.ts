import { Request, Response } from 'express';
import { catchAsync } from '../utils/index';
import { sendResponse } from '../utils/apiResponse';
import {
  getAllMainConcepts,
  getMainConceptById,
  createMainConcept,
  updateMainConcept,
  deleteMainConcept,
} from '../services/mainConceptService';

// Get all main concepts
export const getAllMainConceptsController = catchAsync(
  async (req: Request, res: Response) => {
    const mainConcepts = await getAllMainConcepts();

    return sendResponse(res, 'MAIN_CONCEPTS_FETCHED', {
      data: mainConcepts,
    });
  }
);

// Get a single main concept by ID
export const getMainConceptByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const mainConcept = await getMainConceptById(id);

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
export const createMainConceptController = catchAsync(
  async (req: Request, res: Response) => {
    const { name, description, order, roadmapId, subjectId } = req.body;

    const mainConcept = await createMainConcept({
      name,
      description,
      order: order || 0,
      roadmaps: {
        connect: { id: roadmapId },
      },
      subjects: {
        create: {
          order: 1,
          subject: {
            connect: { id: subjectId },
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
export const updateMainConceptController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, order } = req.body;

    const mainConcept = await getMainConceptById(id);

    if (!mainConcept) {
      return sendResponse(res, 'MAIN_CONCEPT_NOT_FOUND', {
        error: 'Main concept not found',
      });
    }

    const updatedMainConcept = await updateMainConcept(id, {
      name,
      description,
      order: order || mainConcept.order,
    });

    return sendResponse(res, 'MAIN_CONCEPT_UPDATED', {
      data: updatedMainConcept,
    });
  }
);

// Delete a main concept
export const deleteMainConceptController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const mainConcept = await getMainConceptById(id);

    if (!mainConcept) {
      return sendResponse(res, 'MAIN_CONCEPT_NOT_FOUND', {
        error: 'Main concept not found',
      });
    }

    await deleteMainConcept(id);

    return sendResponse(res, 'MAIN_CONCEPT_DELETED', {
      data: { id },
    });
  }
);

// Get subjects in a main concept
export const getSubjectsInMainConceptController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const mainConcept = await getMainConceptById(id);

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
