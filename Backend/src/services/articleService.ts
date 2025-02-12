import { PrismaClient, Article, Status } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import { uploadToCloudinary } from '../utils/cloudinary';

const prisma = new PrismaClient();

interface ArticleData {
  title: string;
  content: string;
  authorId: string;
  topicId: string;
  resourceId?: string;
  status?: Status;
  moderationNotes?: string;
  images?: Express.Multer.File[];
}

export const createArticle = async (data: ArticleData): Promise<Article> => {
  const processedContent = await processArticleContent(
    data.content,
    data.images
  );

  return prisma.article.create({
    data: {
      title: data.title,
      content: processedContent,
      authorId: data.authorId,
      topicId: data.topicId,
      resourceId: data.resourceId,
      status: data.status ?? Status.PENDING,
      moderationNotes: data.moderationNotes,
    },
    include: {
      author: { select: { username: true, avatar_url: true } },
      topic: true,
    },
  });
};

export const updateArticle = async (
  id: string,
  data: Partial<ArticleData>
): Promise<Article> => {
  let processedContent = data.content;
  if (data.content && data.images) {
    processedContent = await processArticleContent(data.content, data.images);
  }

  return prisma.article.update({
    where: { id },
    data: { ...data, content: processedContent },
    include: {
      author: { select: { username: true, avatar_url: true } },
      topic: true,
    },
  });
};

export const getArticle = async (id: string): Promise<Article> => {
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: { select: { username: true, avatar_url: true } },
      topic: true,
      resource: true,
    },
  });

  if (!article) throw createAppError('Article not found', 404);
  return article;
};

export const getArticles = async (filters?: {
  topicId?: string;
  authorId?: string;
  status?: Status;
  search?: string;
}) => {
  return prisma.article.findMany({
    where: {
      topicId: filters?.topicId,
      authorId: filters?.authorId,
      status: filters?.status,
      title: filters?.search
        ? { contains: filters.search, mode: 'insensitive' }
        : undefined,
    },
    include: {
      author: { select: { username: true, avatar_url: true } },
      topic: true,
    },
    orderBy: { created_at: 'desc' },
  });
};

export const deleteArticle = async (id: string): Promise<void> => {
  await prisma.article.delete({ where: { id } });
};

export const moderateArticle = async (
  id: string,
  status: Status,
  moderationNotes?: string
): Promise<Article> => {
  return prisma.article.update({
    where: { id },
    data: { status, moderationNotes },
  });
};

const processArticleContent = async (
  content: string,
  images?: Express.Multer.File[]
): Promise<string> => {
  if (!images?.length) return content;

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
