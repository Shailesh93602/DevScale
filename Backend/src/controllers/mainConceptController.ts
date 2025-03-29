import { Request, Response } from 'express';
import { catchAsync } from '../utils/index';
import { sendResponse } from '../utils/apiResponse';
import { MainConceptRepository } from '../repositories/mainConceptRepository';

export class MainConceptController {
  private readonly mainConceptRepo: MainConceptRepository;

  constructor() {
    this.mainConceptRepo = new MainConceptRepository();
  }

  getAllMainConcepts = catchAsync(async (req: Request, res: Response) => {
    const mainConcepts = await this.mainConceptRepo.findMany();

    return sendResponse(res, 'MAIN_CONCEPTS_FETCHED', {
      data: mainConcepts,
    });
  });

  getMainConceptById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const mainConcept = await this.mainConceptRepo.getMainConceptById(id);

    if (!mainConcept) {
      return sendResponse(res, 'MAIN_CONCEPT_NOT_FOUND', {
        error: 'Main concept not found',
      });
    }

    return sendResponse(res, 'MAIN_CONCEPT_FETCHED', {
      data: mainConcept,
    });
  });

  createMainConcept = catchAsync(async (req: Request, res: Response) => {
    const mainConcept = await this.mainConceptRepo.create(req.body);

    return sendResponse(res, 'MAIN_CONCEPT_CREATED', {
      data: mainConcept,
    });
  });

  createMainConceptWithSubjects = catchAsync(
    async (req: Request, res: Response) => {
      const mainConcept = await this.mainConceptRepo.createWithSubjects(
        req.body
      );

      return sendResponse(res, 'MAIN_CONCEPT_CREATED', {
        data: mainConcept,
      });
    }
  );

  updateMainConcept = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const mainConcept = await this.mainConceptRepo.updateMainConcept(
      id,
      req.body
    );

    return sendResponse(res, 'MAIN_CONCEPT_UPDATED', {
      data: mainConcept,
    });
  });

  deleteMainConcept = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const mainConcept = await this.mainConceptRepo.deleteMainConcept(id);

    return sendResponse(res, 'MAIN_CONCEPT_DELETED', {
      data: mainConcept,
    });
  });
}
