import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository.js';
import { createAppError } from '../utils/errorHandler.js';
import { CategoryData } from '../types/index.js';

import prisma from '../lib/prisma.js';

export default class CategoryRepository extends BaseRepository< Category, typeof prisma.category > {
  constructor() {
    super(prisma.category);
  }

  async manageCategories(data: CategoryData, action: string) {
    switch (action) {
      case 'create':
        return this.create({ data });
      case 'update':
        return this.update({ where: { name: data.name }, data });
      case 'delete':
        return prisma.category.delete({ where: { name: data.name } });
      default:
        throw createAppError('Invalid action', 400);
    }
  }

  async getCategoryHierarchy() {
    const categories = await this.findMany({
      include: { children: { include: { children: true } } },
      where: { parent_id: null },
    });
    return this.buildCategoryTree(categories);
  }

  private buildCategoryTree(
    categories: {
      name: string;
      id: string;
      description: string | null;
      parent_id: string | null;
    }[]
  ) {
    return categories.map((category) => ({
      ...category,
      //   children: category.children
      //     ? this.buildCategoryTree(category.children)
      //     : [],
    }));
  }
}
