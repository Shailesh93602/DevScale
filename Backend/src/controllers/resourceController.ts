import fs from 'fs/promises';
import { Request, Response } from 'express';
import path from 'path';
import prisma from '../prisma';
import { catchAsync } from '../utils';

const __dirname = path.resolve();

export const getSubjects = catchAsync(async (_req: Request, res: Response) => {
  const subjects = await prisma.subject.findMany({
    orderBy: { created_at: 'asc' },
  });
  res.status(200).json({ success: true, subjects });
});

// Topics
export const getTopics = catchAsync(async (req: Request, res: Response) => {
  const topics = await prisma.topic.findMany({
    where: { subjectId: req.params.id },
    orderBy: { created_at: 'asc' },
  });
  res.status(200).json({ success: true, topics });
});

export const addTopic = catchAsync(async (req: Request, res: Response) => {
  const { title, description, subjectId } = req.body;
  const topic = await prisma.topic.create({
    data: { title, description, subjectId },
  });
  res.status(201).json({ success: true, topic });
});

// Resources
export const getResources = catchAsync(async (req: Request, res: Response) => {
  const { limit, offset, search } = req.pagination ?? {};
  const resources = await prisma.subject.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    take: limit,
    skip: offset,
    orderBy: { created_at: 'asc' },
  });
  res.status(200).json({
    success: true,
    resources: resources.map((resource) => ({
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : null,
    })),
  });
});

// Resource by ID
export const getResource = catchAsync(async (req: Request, res: Response) => {
  const subjectId = req.params.id;
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });

  if (!subject) {
    return res
      .status(404)
      .json({ success: false, message: 'Subject not found' });
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId },
    include: {
      articles: {
        select: { id: true, title: true, content: true, status: true },
      },
    },
  });

  res.status(200).json({
    success: true,
    resource: { subject, topics },
  });
});

// Create Subjects
export const createSubjects = catchAsync(
  async (req: Request, res: Response) => {
    const subjects = req.body;
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid subjects array' });
    }
    const createdSubjects = await prisma.subject.createMany({ data: subjects });
    res.status(201).json({
      success: true,
      message: `Created ${createdSubjects.count} subjects successfully.`,
    });
  }
);

// Delete Subjects
export const deleteSubjects = catchAsync(
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid subject IDs array' });
    }
    const deletedCount = await prisma.subject.deleteMany({
      where: { id: { in: ids } },
    });
    res.status(200).json({
      success: true,
      message: `Deleted ${deletedCount.count} subjects successfully.`,
    });
  }
);

// Articles
export const createArticle = catchAsync(async (req: Request, res: Response) => {
  const { title, content, author, topicId } = req.body;
  const article = await prisma.article.create({
    data: {
      title,
      content,
      authorId: author,
      topicId,
    },
  });
  res.status(201).json({ success: true, article });
});

export const getArticle = catchAsync(async (req: Request, res: Response) => {
  const topicId = req.params.id;
  const articles = await prisma.article.findMany({ where: { topicId } });
  res.status(200).json({ success: true, articles });
});

export const selectArticle = catchAsync(async (req: Request, res: Response) => {
  const articleId = req.params.id;
  const article = await prisma.article.update({
    where: { id: articleId },
    data: { status: 'approved' },
  });
  res.status(200).json({ success: true, article });
});

// Interview Questions
export const getInterviewQuestions = catchAsync(
  async (_req: Request, res: Response) => {
    const interviewQuestionsPath = path.join(
      __dirname,
      '../../resources/interviewquestions.json'
    );
    const data = await fs.readFile(interviewQuestionsPath, 'utf8');
    const interviewQuestions = JSON.parse(data);
    res.status(200).json({ success: true, interviewQuestions });
  }
);

// Save Resource
export const saveResource = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  const article = await prisma.article.create({
    data: {
      title: `General Resource`,
      content,
      topicId: id,
      authorId: req.user.id,
      status: 'pending',
    },
  });
  res.status(201).json({
    success: true,
    message: 'Resource saved successfully. Pending approval.',
    data: article,
  });
});

export const createResource = catchAsync(
  async (_req: Request, _res: Response) => {
    // TODO: implement this method
  }
);

export const getResourceDetails = catchAsync(
  async (_req: Request, _res: Response) => {
    // TODO: implement this method
  }
);
