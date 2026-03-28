/* eslint-disable @typescript-eslint/no-explicit-any */

import { PaginatedResult, PaginationParams } from '../types/index.js';
import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma.js';

// Define a shape for Prisma delegate methods we support.
// We use type casting inside the BaseRepository to keep it generic,
// but sub-classes provide strongly typed methods that call these.
export type PrismaDelegate = {
  findUnique?: (args: any) => Promise<any>;
  findFirst?: (args: any) => Promise<any>;
  findMany?: (args: any) => Promise<any[]>;
  create?: (args: any) => Promise<any>;
  createMany?: (args: any) => Promise<any>;
  update?: (args: any) => Promise<any>;
  updateMany?: (args: any) => Promise<any>;
  delete?: (args: any) => Promise<any>;
  deleteMany?: (args: any) => Promise<any>;
  upsert?: (args: any) => Promise<any>;
  count?: (args: any) => Promise<number>;
  groupBy?: (args: any) => Promise<any[]>;
};

// src/repositories/baseRepository.ts
export default abstract class BaseRepository<T, D extends PrismaDelegate = PrismaDelegate> {
  protected prismaClient: PrismaClient;
  protected delegate: D;

  constructor(delegate: D) {
    this.prismaClient = prisma;
    this.delegate = delegate;
  }

  /**
   * Finds a unique record.
   */
  async findUnique(args: unknown): Promise<T | null> {
    return (await this.delegate.findUnique?.(args as any) as unknown as T | null) ?? null;
  }

  /**
   * Finds the first record.
   */
  async findFirst(args: unknown): Promise<T | null> {
    return (await this.delegate.findFirst?.(args as any) as unknown as T | null) ?? null;
  }

  /**
   * Finds multiple records.
   */
  async findMany(args?: unknown): Promise<T[]> {
    return (await this.delegate.findMany?.(args as any) as unknown as T[]) ?? [];
  }

  /**
   * Creates a new record.
   */
  async create(args: unknown): Promise<T> {
    return this.delegate.create?.(args as any) as unknown as T;
  }

  /**
   * Creates multiple records.
   */
  async createMany(args: unknown): Promise<{ count: number }> {
    return (await this.delegate.createMany?.(args as any) as unknown as { count: number }) ?? { count: 0 };
  }

  /**
   * Updates an existing record.
   */
  async update(args: unknown): Promise<T> {
    return this.delegate.update?.(args as any) as unknown as T;
  }

  /**
   * Updates multiple records.
   */
  async updateMany(args: unknown): Promise<{ count: number }> {
    return (await this.delegate.updateMany?.(args as any) as unknown as { count: number }) ?? { count: 0 };
  }

  /**
   * Deletes a record.
   */
  async delete(args: unknown): Promise<T> {
    return this.delegate.delete?.(args as any) as unknown as T;
  }

  /**
   * Deletes multiple records.
   */
  async deleteMany(args: unknown): Promise<{ count: number }> {
    return (await this.delegate.deleteMany?.(args as any) as unknown as { count: number }) ?? { count: 0 };
  }

  /**
   * Upserts a record.
   */
  async upsert(args: unknown): Promise<T> {
    return this.delegate.upsert?.(args as any) as unknown as T;
  }

  /**
   * Counts records matching the criteria.
   */
  async count(args?: unknown): Promise<number> {
    return (await this.delegate.count?.(args as any) as unknown as number) ?? 0;
  }

  /**
   * Get records grouped by a specific field.
   */
  async groupBy(args: unknown): Promise<unknown[]> {
    return (await this.delegate.groupBy?.(args as any) as unknown as unknown[]) ?? [];
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
    selection?: { include?: Record<string, unknown>; select?: Record<string, unknown> },
    whereClause: Record<string, unknown> = {}
  ): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    
    // Internal logic uses type assertions to interact with Prisma's complex 'where' types.
    const where = { ...whereClause } as any;

    // If search text is provided and search fields exist, add search conditions.
    if (options.search && searchFields && searchFields.length > 0) {
      const searchConditions = searchFields.map((field) => ({
        [field]: {
          contains: options.search,
          mode: 'insensitive',
        },
      }));

      if (where.AND) {
        where.AND.push({ OR: searchConditions });
      } else if (where.OR) {
        const existingOR = where.OR;
        where.AND = [{ OR: existingOR }, { OR: searchConditions }];
      } else {
        where.OR = searchConditions;
      }
    }

    // Merge additional filters if provided.
    if (options.filter) {
      where.AND = [
        ...(where.AND || []),
        ...Object.entries(options.filter).map(([key, value]) => ({
          [key]: value,
        })),
      ];
    }

    const [total, data] = await Promise.all([
      (this.delegate.count?.({ where }) || Promise.resolve(0)),
      (this.delegate.findMany?.({
        where,
        skip,
        take: limit,
        orderBy: options.sort
          ? { [options.sort.field]: (options.sort as any).direction }
          : undefined,
        ...selection,
      }) || Promise.resolve([])) as Promise<T[]>,
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
