import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';

const prisma = new PrismaClient();

export async function getPlacementResources(
  user_id: string,
  subject_id?: string
) {
  return prisma.placementTest.findMany({
    where: {
      user_id,
      subject_id,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
}

export async function getRecommendedBooks(subject_id: string, level: string) {
  const books = await prisma.placementBook.findMany({
    where: {
      subject_id,
      level,
    },
    select: {
      id: true,
      title: true,
      description: true,
      file_path: true,
    },
  });

  if (books.length === 0) {
    throw createAppError('No books found for this level', 404);
  }

  return books;
}
