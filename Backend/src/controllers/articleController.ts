import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';

const prisma = new PrismaClient();

export const getArticles = catchAsync(async (req: Request, res: Response) => {
  const { status, search } = req.query as {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    search?: string;
  };

  const whereCondition: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    OR?: [
      {
        title: { contains: string; mode: 'insensitive' };
      },
      {
        content: { contains: string; mode: 'insensitive' };
      },
    ];
  } = {};

  if (status) {
    whereCondition.status = status;
  }

  if (search) {
    whereCondition.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  const articles = await prisma.article.findMany({
    where: whereCondition,
    include: {
      author: {
        select: { username: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  res.status(200).json({
    success: true,
    message: 'Articles fetched successfully',
    articles,
  });
});

export const updateArticleStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id, status } = req.query as {
      id: string;
      status: 'APPROVED' | 'REJECTED';
    };

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: { status },
    });

    res
      .status(200)
      .json({ message: 'Article status updated successfully', updatedArticle });
  }
);

export const updateArticleContent = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title && !content) {
      return res
        .status(400)
        .json({ error: 'Please provide title or content to update' });
    }

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: { title, content },
    });

    res.status(200).json({
      success: true,
      message: 'Article content updated successfully',
      updatedArticle,
    });
  }
);

export const getArticleById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: { username: true },
        },
      },
    });

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: 'Article not found.' });
    }

    res.status(200).json({ success: true, article });
  }
);

export const updateModerationNotes = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { moderationNotes } = req.body;

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: { moderationNotes },
    });

    res.status(200).json({
      success: true,
      message: 'Moderation notes updated successfully',
      updatedArticle,
    });
  }
);

export const getMyArticles = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const articles = await prisma.article.findMany({
    where: { authorId: userId },
    select: { id: true, title: true, status: true },
    orderBy: { created_at: 'desc' },
  });

  res.status(200).json({
    success: true,
    message: 'Articles retrieved successfully',
    articles,
  });
});

export const getArticleComments = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, moderationNotes: true },
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      comments: article.moderationNotes,
    });
  }
);
