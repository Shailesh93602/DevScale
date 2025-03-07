import { Request, Response } from 'express';
import { catchAsync } from '../utils/index';
import { sendResponse } from '../utils/apiResponse';
import { getTopicsBySubjectId } from '../services/topicService';
import { paginate, parsePaginationQuery } from '../utils/pagination';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllSubjects = catchAsync(
  async (req: Request, res: Response) => {
    const params = parsePaginationQuery(req.query);

    // Add your custom validations here if needed
    if (params.page < 1) {
      return sendResponse(res, 'INVALID_PAGE_NUMBER');
    }

    // Execute pagination
    const subjects = await paginate<'subject'>(prisma.subject, params, [
      'title',
      'description',
    ]);
    return sendResponse(res, 'SUBJECTS_FETCHED', { data: subjects });
  }
);

export const getTopicsInSubject = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const topics = await getTopicsBySubjectId(id);

    if (topics) {
      return sendResponse(res, 'TOPICS_FETCHED', { data: topics });
    }

    return sendResponse(res, 'TOPICS_NOT_FOUND');
  }
);
