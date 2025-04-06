import fs from 'fs/promises';
import { Request, Response } from 'express';
import path from 'path';
import prisma from '../prisma';
import { catchAsync } from '../utils';
import Joi from 'joi';
import { sendResponse } from '@/utils/apiResponse';
import { createAppError } from '@/utils/errorHandler';

const __dirname = path.resolve();

export default class ResourceController {
  public getSubjects = catchAsync(async (_req: Request, res: Response) => {
    const subjects = await prisma.subject.findMany({
      orderBy: { created_at: 'asc' },
    });
    sendResponse(res, 'SUBJECTS_FETCHED', { data: { subjects } });
  });

  // Topics
  public getTopics = catchAsync(async (req: Request, res: Response) => {
    const topics = await prisma.topic.findMany({
      where: {
        subjects: {
          some: {
            id: req.params.id,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });
    sendResponse(res, 'TOPICS_FETCHED', { data: { topics } });
  });

  public addTopic = catchAsync(async (req: Request, res: Response) => {
    const { title, description, subject_id } = req.body;
    const topic = await prisma.topic.create({
      data: {
        title,
        description,
        subjects: {
          connect: { id: subject_id },
        },
        order: 0,
      },
    });
    sendResponse(res, 'TOPIC_ADDED', { data: { topic } });
  });

  // Resources
  public getResources = catchAsync(async (req: Request, res: Response) => {
    const { limit, offset, search } = req.pagination ?? {};
    const resources = await prisma.subject.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      take: limit,
      skip: offset,
      orderBy: { created_at: 'asc' },
    });
    sendResponse(res, 'RESOURCES_FETCHED', { data: { resources } });
  });

  // Resource by ID
  public getResource = catchAsync(async (req: Request, res: Response) => {
    const subject_id = req.params.id;
    const subject = await prisma.subject.findUnique({
      where: { id: subject_id },
    });

    if (!subject) {
      throw createAppError('Subject not found', 404);
    }

    const topics = await prisma.topic.findMany({
      where: {
        subjects: {
          some: {
            id: subject_id,
          },
        },
      },
      include: {
        articles: {
          select: { id: true, title: true, content: true, status: true },
        },
      },
    });

    sendResponse(res, 'RESOURCE_FETCHED', { data: { subject, topics } });
  });

  // Create Subjects
  public createSubjects = catchAsync(async (req: Request, res: Response) => {
    const subjects = req.body;
    if (!Array.isArray(subjects) || subjects.length === 0) {
      throw createAppError('Invalid subjects array', 400);
    }
    const createdSubjects = await prisma.subject.createMany({ data: subjects });
    sendResponse(res, 'SUBJECTS_CREATED', {
      data: { subjects: createdSubjects },
    });
  });

  // Delete Subjects
  public deleteSubjects = catchAsync(async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw createAppError('Invalid subject IDs array', 400);
    }
    await prisma.subject.deleteMany({
      where: { id: { in: ids } },
    });

    sendResponse(res, 'SUBJECTS_DELETED');
  });

  // Articles
  public createArticle = catchAsync(async (req: Request, res: Response) => {
    const { title, content, author_id, topic_id } = req.body;
    const article = await prisma.article.create({
      data: {
        title,
        content,
        author_id: author_id,
        topic_id: topic_id,
      },
    });
    sendResponse(res, 'ARTICLE_CREATED', { data: { article } });
  });

  public getArticle = catchAsync(async (req: Request, res: Response) => {
    const topic_id = req.params.id;
    const articles = await prisma.article.findMany({ where: { topic_id } });
    sendResponse(res, 'ARTICLES_FETCHED', { data: { articles } });
  });

  public selectArticle = catchAsync(async (req: Request, res: Response) => {
    const articleId = req.params.id;
    const article = await prisma.article.update({
      where: { id: articleId },
      data: { status: 'APPROVED' },
    });
    sendResponse(res, 'ARTICLE_UPDATED', { data: { articles: article } });
  });

  // Interview Questions
  public getInterviewQuestions = catchAsync(
    async (_req: Request, res: Response) => {
      const interviewQuestionsPath = path.join(
        __dirname,
        '../../resources/interviewquestions.json'
      );
      const data = await fs.readFile(interviewQuestionsPath, 'utf8');
      const interviewQuestions = JSON.parse(data);
      sendResponse(res, 'INTERVIEW_QUESTIONS_FETCHED', {
        data: { interviewQuestions },
      });
    }
  );

  // Save Resource
  public saveResource = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content } = req.body;
    const article = await prisma.article.create({
      data: {
        title: `General Resource`,
        content,
        topic_id: id,
        author_id: req.user?.id ?? '',
        status: 'PENDING',
      },
    });

    sendResponse(res, 'RESOURCE_CREATED', { data: { article } });
  });

  // Resource creation validation schema
  createResourceSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    type: Joi.string().required(),
    subjectId: Joi.string().when('type', {
      is: 'SUBJECT',
      then: Joi.string().required(),
      otherwise: Joi.string().optional(),
    }),
    topicId: Joi.string().when('type', {
      is: 'TOPIC',
      then: Joi.string().required(),
      otherwise: Joi.string().optional(),
    }),
    authorId: Joi.string().required(),
    filePath: Joi.string().optional(),
  });

  // Complete createResource controller
  public createResource = catchAsync(async (req: Request, res: Response) => {
    const {
      title,
      content,
      type,
      description,
      url,
      category,
      difficulty,
      language,
    } = req.body;

    const resource = await prisma.resource.create({
      data: {
        title,
        content,
        type,
        description,
        url,
        category,
        difficulty,
        language,
        user_id: req?.user?.id ?? '',
      },
    });

    sendResponse(res, 'RESOURCE_CREATED', { data: resource });
  });

  // Complete getResourceDetails controller
  public getResourceDetails = catchAsync(
    async (req: Request, res: Response) => {
      const resourceId = req.params.id;

      if (!Joi.string().uuid().validate(resourceId).error) {
        throw createAppError('Invalid resource ID format', 400);
      }

      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
        include: {
          articles: {
            select: {
              id: true,
              title: true,
              content: true,
              status: true,
              created_at: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      if (!resource) {
        throw createAppError('Resource not found', 404);
      }

      sendResponse(res, 'RESOURCE_DETAILS_FETCHED', { data: resource });
    }
  );
}
