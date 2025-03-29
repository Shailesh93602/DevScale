import { Request, Response } from 'express';
import { catchAsync } from '../utils/index';
import { sendResponse } from '../utils/apiResponse';
import SubjectRepository from '../repositories/subjectRepository';

export default class SubjectController {
  private readonly subjectRepository: SubjectRepository;

  constructor() {
    this.subjectRepository = new SubjectRepository();
  }

  public getAllSubjects = catchAsync(async (req: Request, res: Response) => {
    const { limit = 10, page = 1, search = '' } = req.query;
    const subjects = await this.subjectRepository.paginate(
      {
        limit: Number(limit),
        page: Number(page),
        search: String(search),
      },
      ['title']
    );
    return sendResponse(res, 'SUBJECTS_FETCHED', { data: subjects });
  });

  public getTopicsInSubject = catchAsync(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const subject = await this.subjectRepository.findUnique({
        where: { id },
        include: {
          topics: {
            select: {
              topic: true,
            },
          },
        },
      });

      if (!subject) {
        return sendResponse(res, 'SUBJECT_NOT_FOUND');
      }

      return sendResponse(res, 'TOPICS_FETCHED', { data: subject });
    }
  );

  public createSubject = catchAsync(async (req: Request, res: Response) => {
    const subject = await this.subjectRepository.create(req.body);
    return sendResponse(res, 'SUBJECT_CREATED', { data: subject });
  });

  public updateSubject = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subject = await this.subjectRepository.update({
      where: { id },
      data: req.body,
    });
    return sendResponse(res, 'SUBJECT_UPDATED', { data: subject });
  });

  public deleteSubject = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subject = await this.subjectRepository.delete({ where: { id } });
    return sendResponse(res, 'SUBJECT_DELETED', { data: subject });
  });
}
