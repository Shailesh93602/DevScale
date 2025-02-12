import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';

const prisma = new PrismaClient();

export async function getPlacementResources(
  userId: string,
  subjectId?: string
) {
  return prisma.placementTest.findMany({
    where: {
      userId,
      subjectId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getRecommendedBooks(subjectId: string, level: string) {
  const books = await prisma.placementBook.findMany({
    where: {
      subjectId,
      level,
    },
    select: {
      id: true,
      title: true,
      description: true,
      filePath: true,
    },
  });

  if (books.length === 0) {
    throw createAppError('No books found for this level', 404);
  }

  return books;
}
