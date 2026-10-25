import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { catchAsync } from '../utils';
import Joi from 'joi';
import { sendResponse } from '../utils/apiResponse';
import { createAppError } from '../utils/errorHandler';
import { sanitizeText, sanitizeRichText } from '../utils/sanitize';
import { withAudit } from '../services/auditTrail';
import interviewQuestions from '../../resources/interviewquestions.json' with { type: 'json' };

// Root directory of the project (for resource file paths)

export default class ResourceController {
  // Resources Listing
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
    sendResponse(res, 'RESOURCES_FETCHED', { data: resources });
  });

  // Specific Resource by ID
  public getResource = catchAsync(async (req: Request, res: Response) => {
    const subject_id = req.params.id;
    const subject = await prisma.subject.findUnique({
      where: { id: subject_id },
    });
    if (!subject) throw createAppError('Subject not found', 404);

    const topics = await prisma.topic.findMany({
      where: { subjects: { some: { id: subject_id } } },
      include: {
        articles: {
          select: { id: true, title: true, content: true, status: true },
        },
      },
    });

    sendResponse(res, 'RESOURCE_FETCHED', { data: { subject, topics } });
  });

  // Bulk Create Subjects
  public createSubjects = catchAsync(async (req: Request, res: Response) => {
    const subjects = req.body;
    if (!Array.isArray(subjects) || subjects.length === 0) {
      throw createAppError('Invalid subjects array', 400);
    }
    const created = await prisma.subject.createMany({ data: subjects });
    sendResponse(res, 'SUBJECTS_CREATED', { data: created });
  });

  // Bulk Delete Subjects
  public deleteSubjects = catchAsync(async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw createAppError('Invalid subject IDs array', 400);
    }
    // Audited in the delete's transaction. A count mismatch means a concurrent
    // delete raced us; roll back rather than record ids we did not remove.
    await withAudit(
      (deletedIds: string[]) => ({
        admin_id: req.user.id,
        action: 'BULK_DELETE_SUBJECTS',
        entity: 'SUBJECT',
        entity_id: 'BULK',
        details: {
          requested_ids: ids,
          deleted_ids: deletedIds,
          count: deletedIds.length,
        },
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      }),
      async (tx) => {
        const found = await tx.subject.findMany({
          where: { id: { in: ids } },
          select: { id: true },
        });
        const deletedIds = found.map((s) => s.id);
        const { count } = await tx.subject.deleteMany({
          where: { id: { in: deletedIds } },
        });
        if (count !== deletedIds.length) {
          throw createAppError('Subjects changed during delete, retry', 409);
        }
        return deletedIds;
      }
    );
    sendResponse(res, 'SUBJECTS_DELETED');
  });

  // Interview Questions.
  //
  // IMPORTED, not read from disk at runtime. It used to be
  // `fs.readFile(projectRoot/resources/interviewquestions.json)`, which works
  // locally and silently returns nothing once deployed: Vercel's bundler traces
  // imports to decide what ships, so a data file that nothing imports is simply
  // absent from the serverless function. The read threw ENOENT, catchAsync
  // swallowed it into a 500, the frontend fell back to `[]`, and the page
  // rendered a heading over blank space with no indication anything was wrong.
  //
  // An import is traced, so the data is part of the bundle by construction —
  // and a missing file becomes a BUILD failure rather than a runtime one.
  public getInterviewQuestions = catchAsync(
    async (_req: Request, res: Response) => {
      sendResponse(res, 'INTERVIEW_QUESTIONS_FETCHED', {
        data: interviewQuestions,
      });
    }
  );

  // Save a new resource article
  public saveResource = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    // This creates an Article, which the frontend renders through
    // dangerouslySetInnerHTML. POST /articles sanitises; this path did not, so
    // it was a stored-XSS bypass around the article sanitiser.
    const content = sanitizeRichText(req.body.content ?? '');
    const article = await prisma.article.create({
      data: {
        title: 'General Resource',
        content,
        topic_id: id,
        author_id: req.user?.id || '',
        status: 'PENDING',
      },
    });
    sendResponse(res, 'RESOURCE_CREATED', { data: article });
  });

  // Validation schema for resource creation
  private createResourceSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    type: Joi.string().required(),
    subjectId: Joi.string().when('type', {
      is: 'SUBJECT',
      then: Joi.string().required(),
    }),
    topicId: Joi.string().when('type', {
      is: 'TOPIC',
      then: Joi.string().required(),
    }),
    authorId: Joi.string().required(),
    filePath: Joi.string().optional(),
  });

  // Create Resource (generic)
  public createResource = catchAsync(async (req: Request, res: Response) => {
    const { type, url, category, difficulty, language } = req.body;
    // Resource content is rendered as HTML on /resources/[id]. Titles and
    // descriptions are plain text; content is rich text.
    const title = sanitizeText(req.body.title ?? '');
    const description = sanitizeText(req.body.description ?? '');
    const content = sanitizeRichText(req.body.content ?? '');
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
        user_id: req.user?.id || '',
      },
    });
    sendResponse(res, 'RESOURCE_CREATED', { data: resource });
  });

  // Detailed Resource by ID
  public getResourceDetails = catchAsync(
    async (req: Request, res: Response) => {
      const resourceId = req.params.id;
      const { error } = Joi.string().uuid().validate(resourceId);
      if (error) throw createAppError('Invalid resource ID format', 400);

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
          user: { select: { id: true, username: true, email: true } },
        },
      });

      if (!resource) throw createAppError('Resource not found', 404);
      sendResponse(res, 'RESOURCE_DETAILS_FETCHED', { data: resource });
    }
  );
}
