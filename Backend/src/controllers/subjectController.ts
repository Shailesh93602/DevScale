import { Request, Response } from 'express';
import { catchAsync } from '../utils/index.js';
import { sendResponse } from '../utils/apiResponse.js';
import SubjectRepository from '../repositories/subjectRepository.js';
import prisma from '../lib/prisma.js';
import { isUuid } from '../utils/slugify.js';
import { Prisma } from '@prisma/client';

type SubjectWithTopics = Prisma.SubjectGetPayload<{
  include: { topics: { include: { topic: true } } };
}>;

export default class SubjectController {
  private readonly subjectRepository: SubjectRepository;

  constructor() {
    this.subjectRepository = new SubjectRepository();
  }
  public getAllSubjects = catchAsync(async (req: Request, res: Response) => {
    const { limit = 10, page = 1 } = req.query;
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const subjects = await this.subjectRepository.paginate(
      {
        limit: Number(limit),
        page: Number(page),
        search,
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

      // Accept slug or UUID
      const where = isUuid(id) ? { id } : { slug: id };
      const subject = (await this.subjectRepository.findUnique({
        where,
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
      })) as SubjectWithTopics | null;

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
            topic_id: { in: subject.topics.map((t) => t.topic_id) },
          },
        });

        const completedMap = new Set(
          userProgressList.filter((p) => p.is_completed).map((p) => p.topic_id)
        );

        topicsWithProgress = subject.topics.map((t) => ({
          ...t,
          topic: {
            ...t.topic,
            isCompleted: completedMap.has(t.topic_id),
          },
        }));
      }

      return sendResponse(res, 'TOPICS_FETCHED', {
        data: {
          ...subject,
          topics: topicsWithProgress,
        },
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
