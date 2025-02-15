import {
  PrismaClient,
  Article,
  Status,
  ContentModeration,
} from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import { uploadToCloudinary } from '../utils/cloudinary';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface ArticleSubmissionData {
  title: string;
  content: string;
  author_id: string;
  topic_id: string;
  tags?: string[];
  images?: Express.Multer.File[];
}

export interface ReviewData {
  article_id: string;
  reviewer_id: string;
  status: Status;
  moderations: ContentModeration[];
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
      author_id: data.author_id,
      topic_id: data.topic_id,
      status: Status.PENDING,
    },
    include: {
      author: { select: { username: true, avatar_url: true } },
      topic: true,
    },
  });

  await trackSubmission(data.author_id, article.id);
  return article;
};

export const reviewArticle = async (data: ReviewData): Promise<Article> => {
  const article = await prisma.article.update({
    where: { id: data.article_id },
    data: {
      status: data.status,
      moderations: { set: data.moderations },
    },
    include: { author: { select: { username: true, email: true } } },
  });

  await notifyAuthor(article);
  return article;
};

export const getArticlesByTopic = async (topic_id: string) => {
  return prisma.article.findMany({
    where: { topic_id: topic_id, status: Status.APPROVED },
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

export const getArticleVersions = async (article_id: string) => {
  return prisma.version.findMany({
    where: { article_id: article_id },
    orderBy: { version: 'desc' },
  });
};

export const updateArticle = async (
  id: string,
  data: Partial<ArticleSubmissionData>
): Promise<Article> => {
  const currentArticle = await prisma.article.findUnique({ where: { id } });
  if (!currentArticle) throw createAppError('Article not found', 404);

  await prisma.version.create({
    data: {
      article_id: id,
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

const getLatestVersion = async (article_id: string): Promise<number> => {
  const latestVersion = await prisma.version.findFirst({
    where: { article_id: article_id },
    orderBy: { version: 'desc' },
  });
  return latestVersion?.version ?? 0;
};

const trackSubmission = async (
  author_id: string,
  article_id: string
): Promise<void> => {
  try {
    await prisma.submissionLog.create({
      data: { author_id: author_id, article_id: article_id, type: 'article' },
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
        user_id: article.author_id,
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
