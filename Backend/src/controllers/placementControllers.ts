import { Request, Response } from 'express';
import { createAppError } from '../utils/errorHandler';
import { catchAsync } from '../utils';
import {
  getBooksSchema,
  getResourcesSchema,
} from '../validations/placementValidation';
import PlacementRepository from '@/repositories/placementRepository';
import { sendResponse } from '@/utils/apiResponse';

export default class PlacementController {
  private readonly placementRepo: PlacementRepository;
  constructor() {
    this.placementRepo = new PlacementRepository();
  }

  public getResources = catchAsync(async (req: Request, res: Response) => {
    const { error, value } = getResourcesSchema.validate(req.query);
    if (error) throw createAppError(error.message, 400);

    const resources = await this.placementRepo.getPlacementResources(
      value.userId,
      value.subjectId
    );

    sendResponse(res, 'RESOURCES_FETCHED', { data: resources });
  });

  public getBooks = catchAsync(async (req: Request, res: Response) => {
    const { error, value } = getBooksSchema.validate(req.query);
    if (error) throw createAppError(error.message, 400);

    const books = await this.placementRepo.getRecommendedBooks(
      value.subjectId,
      value.level
    );

    sendResponse(res, 'BOOKS_FETCHED', { data: books });
  });
}
