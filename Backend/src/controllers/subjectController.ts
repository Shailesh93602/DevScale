import { Request, Response } from 'express';
import { catchAsync } from '../utils/index';
import { sendResponse } from '../utils/apiResponse';
import SubjectRepository from '../repositories/subjectRepository';
import prisma from '../lib/prisma';

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
    return sendResponse(res, 'SUBJECTS_FETCHED', {
      data: subjects.data,
      meta: subjects.meta,
    });
  });

  public getTopicsInSubject = catchAsync(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const userId = req.user?.id;

      const subject = (await this.subjectRepository.findUnique({
        where: { id },
        include: {
          topics: {
            include: {
              topic: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      })) as any;

      if (!subject) {
        return sendResponse(res, 'SUBJECT_NOT_FOUND');
      }

      // Format topics and inject progress
      let topicsWithProgress = subject.topics;

      if (userId) {
        // Fetch user progress for topics in this subject
        const userProgressList = await prisma.userProgress.findMany({
          where: {
            user_id: userId,
            topic_id: { in: subject.topics.map((t: any) => t.topic_id) }
          }
        });

        const completedMap = new Set(
          userProgressList.filter((p: any) => p.is_completed).map((p: any) => p.topic_id)
        );

        topicsWithProgress = subject.topics.map((t: any) => ({
          ...t,
          topic: {
            ...t.topic,
            isCompleted: completedMap.has(t.topic_id)
          }
        }));
      }

      return sendResponse(res, 'TOPICS_FETCHED', {
        data: {
          ...subject,
          topics: topicsWithProgress
        }
      });
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
