import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/errorHandler.js';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class PlacementRepository extends BaseRepository< PlacementTest, typeof prisma.placementTest > {
  constructor() {
    super(prisma.placementTest);
  }
  async getPlacementResources(user_id: string, subject_id?: string) {
    return this.findMany({
      where: {
        user_id,
        subject_id,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getRecommendedBooks(subject_id: string, level: string) {
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
}
