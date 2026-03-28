/* eslint-disable @typescript-eslint/no-explicit-any */

import { PaginatedResult, PaginationParams } from '../types/index.js';
import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma.js';

type PrismaDelegate = {
  findUnique: (...args: any[]) => Promise<any>;
  findMany: (...args: any[]) => Promise<any[]>;
  create: (...args: any[]) => Promise<any>;
  update: (...args: any[]) => Promise<any>;
  delete: (...args: any[]) => Promise<any>;
  upsert: (...args: any[]) => Promise<any>;
  count: (...args: any[]) => Promise<number>;
  groupBy: (...args: any[]) => Promise<any>;
  findFirst: (...args: any[]) => Promise<any>;
  createMany: (...args: any[]) => Promise<any>;
  updateMany: (...args: any[]) => Promise<any>;
  deleteMany: (...args: any[]) => Promise<any>;
};

// src/repositories/baseRepository.ts
export default abstract class BaseRepository<D extends PrismaDelegate> {
  protected prismaClient: PrismaClient;
  protected delegate: D;

  constructor(delegate: D) {
    this.prismaClient = prisma;
    this.delegate = delegate;
  }

  /**
   * Finds a unique record.
   */
  async findUnique(args: any): Promise<any> {
    return this.delegate.findUnique(args);
  }

  /**
   * Finds the first record.
   */
  async findFirst(args: any): Promise<any> {
    return this.delegate.findFirst(args);
  }

  /**
   * Finds multiple records.
   */
  async findMany(args?: any): Promise<any[]> {
    return this.delegate.findMany(args);
  }

  /**
   * Creates a new record.
   */
  async create(args: any): Promise<any> {
    return this.delegate.create(args);
  }

  /**
   * Creates multiple records.
   */
  async createMany(args: any): Promise<any> {
    return this.delegate.createMany(args);
  }

  /**
   * Updates an existing record.
   */
  async update(args: any): Promise<any> {
    return this.delegate.update(args);
  }

  /**
   * Updates multiple records.
   */
  async updateMany(args: any): Promise<any> {
    return this.delegate.updateMany(args);
  }

  /**
   * Deletes a record.
   */
  async delete(args: any): Promise<any> {
    return this.delegate.delete(args);
  }

  /**
   * Deletes multiple records.
   */
  async deleteMany(args: any): Promise<any> {
    return this.delegate.deleteMany(args);
  }

  /**
   * Upserts a record.
   */
  async upsert(args: any): Promise<any> {
    return this.delegate.upsert(args);
  }

  /**
   * Counts records matching the criteria.
   */
  async count(args?: any): Promise<number> {
    return this.delegate.count(args);
  }

  /**
   * Get records grouped by a specific field.
   */
  async groupBy(args: any): Promise<any> {
    return this.delegate.groupBy(args);
  }

  /**
   * Paginates records with support for search, filtering, and sorting.
   *
   * @param options - Pagination options (page, limit, search, filter, sort)
   * @param searchFields - List of fields to perform text search on
   * @param selection - Additional query selections (include or select)
   * @param whereClause - Base filtering conditions
   */
  async paginate(
    options: PaginationParams,
    searchFields?: string[],
    selection?: { include?: Record<string, any>; select?: Record<string, any> },
    whereClause: Record<string, any> = {}
  ): Promise<PaginatedResult<any>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    let finalWhere = { ...whereClause };

    // If search text is provided and search fields exist, add search conditions.
    if (options.search && searchFields && searchFields.length > 0) {
      const searchConditions = searchFields.map((field) => ({
        [field]: {
          contains: options.search,
          mode: 'insensitive',
        },
      }));

      if (finalWhere.AND) {
        finalWhere.AND.push({ OR: searchConditions });
      } else if (finalWhere.OR) {
        const existingOR = finalWhere.OR;
        finalWhere = { AND: [{ OR: existingOR }, { OR: searchConditions }] };
      } else {
        finalWhere.OR = searchConditions;
      }
    }

    // Merge additional filters if provided.
    if (options.filter) {
      finalWhere = {
        ...finalWhere,
        AND: [
          ...(finalWhere.AND || []),
          ...Object.entries(options.filter).map(([key, value]) => ({
            [key]: value,
          })),
        ],
      };
    }

    const [total, data] = await Promise.all([
      this.delegate.count({ where: finalWhere }),
      this.delegate.findMany({
        where: finalWhere,
        skip,
        take: limit,
        orderBy: options.sort
          ? { [options.sort.field]: options.sort.direction }
          : undefined,
        ...selection,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        currentPage: page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
