import { Request, Response } from 'express';
import {
  getPlacementResources,
  getRecommendedBooks,
} from '../services/placementService';
import { createAppError } from '../utils/errorHandler';
import { catchAsync } from '../utils';
import {
  getBooksSchema,
  getResourcesSchema,
} from '../validations/placementValidation';

export const getResources = catchAsync(async (req: Request, res: Response) => {
  const { error, value } = getResourcesSchema.validate(req.query);
  if (error) throw createAppError(error.message, 400);

  const resources = await getPlacementResources(value.userId, value.subjectId);

  res.status(200).json({
    status: 'success',
    data: resources,
  });
});

export const getBooks = catchAsync(async (req: Request, res: Response) => {
  const { error, value } = getBooksSchema.validate(req.query);
  if (error) throw createAppError(error.message, 400);

  const books = await getRecommendedBooks(value.subjectId, value.level);

  res.status(200).json({
    status: 'success',
    data: books,
  });
});
