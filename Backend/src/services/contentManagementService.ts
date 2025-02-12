import { PrismaClient, Article, Status } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import { uploadToCloudinary } from '../utils/cloudinary';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface ArticleSubmissionData {
  title: string;
  content: string;
  authorId: string;
  topicId: string;
  tags?: string[];
  images?: Express.Multer.File[];
}

export interface ReviewData {
  articleId: string;
  reviewerId: string;
  status: Status;
  moderationNotes?: string;
}

export const submitArticle = async (
  data: ArticleSubmissionData
): Promise<Article> => {
  let processedContent = data.content;
  if (data.images?.length) {
    processedContent = await processArticleImages(data.content, data.images);
  }

  const article = await prisma.article.create({
    data: {
      title: data.title,
      content: processedContent,
      authorId: data.authorId,
      topicId: data.topicId,
      status: Status.PENDING,
    },
    include: {
      author: { select: { username: true, avatar_url: true } },
      topic: true,
    },
  });

  await trackSubmission(data.authorId, article.id);
  return article;
};

export const reviewArticle = async (data: ReviewData): Promise<Article> => {
  const article = await prisma.article.update({
    where: { id: data.articleId },
    data: { status: data.status, moderationNotes: data.moderationNotes },
    include: { author: { select: { username: true, email: true } } },
  });

  await notifyAuthor(article);
  return article;
};

export const getArticlesByTopic = async (topicId: string) => {
  return prisma.article.findMany({
    where: { topicId, status: Status.APPROVED },
    include: {
      author: { select: { username: true, avatar_url: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { created_at: 'desc' },
  });
};

export const getPendingArticles = async () => {
  return prisma.article.findMany({
    where: { status: Status.PENDING },
    include: {
      author: { select: { username: true, avatar_url: true } },
      topic: true,
    },
    orderBy: { created_at: 'asc' },
  });
};

export const getArticleVersions = async (articleId: string) => {
  return prisma.articleVersion.findMany({
    where: { articleId },
    orderBy: { version: 'desc' },
  });
};

export const updateArticle = async (
  id: string,
  data: Partial<ArticleSubmissionData>
): Promise<Article> => {
  const currentArticle = await prisma.article.findUnique({ where: { id } });
  if (!currentArticle) throw createAppError('Article not found', 404);

  await prisma.articleVersion.create({
    data: {
      articleId: id,
      content: currentArticle.content,
      title: currentArticle.title,
      version: (await getLatestVersion(id)) + 1,
    },
  });

  let processedContent = data.content;
  if (data.images?.length) {
    processedContent = await processArticleImages(
      data.content ?? currentArticle.content,
      data.images
    );
  }

  return prisma.article.update({
    where: { id },
    data: {
      title: data.title,
      content: processedContent,
      status: Status.PENDING,
    },
    include: {
      author: { select: { username: true, avatar_url: true } },
      topic: true,
    },
  });
};

// Helper functions
const processArticleImages = async (
  content: string,
  images: Express.Multer.File[]
): Promise<string> => {
  let processedContent = content;
  for (const image of images) {
    const imageUrl = await uploadToCloudinary(image, 'articles');
    processedContent = processedContent.replace(
      `[image:${image.originalname}]`,
      `![${image.originalname}](${imageUrl})`
    );
  }
  return processedContent;
};

const getLatestVersion = async (articleId: string): Promise<number> => {
  const latestVersion = await prisma.articleVersion.findFirst({
    where: { articleId },
    orderBy: { version: 'desc' },
  });
  return latestVersion?.version ?? 0;
};

const trackSubmission = async (
  authorId: string,
  articleId: string
): Promise<void> => {
  try {
    await prisma.submissionLog.create({
      data: { authorId, articleId, type: 'article' },
    });
  } catch (error) {
    logger.error('Error tracking submission:', error);
  }
};

const notifyAuthor = async (
  article: Article & { author: { username: string; email: string } }
): Promise<void> => {
  try {
    await prisma.notification.create({
      data: {
        userId: article.authorId,
        title: 'Article Review Update',
        message: `Your article "${article.title}" has been ${article.status}`,
        type: 'system',
        link: `/articles/${article.id}`,
      },
    });
  } catch (error) {
    logger.error('Error notifying author:', error);
  }
};
