/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/pagination.ts

import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

// Add this interface for parsed query parameters
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Add this query parser helper
export function parsePaginationQuery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: Record<string, any>
): PaginationParams {
  return {
    page: Math.max(1, parseInt(query.page) || 1),
    limit: Math.min(100, Math.max(1, parseInt(query.limit) || 10)),
    search: query.search?.toString(),
    filter:
      typeof query.filter === 'string'
        ? JSON.parse(query.filter)
        : query.filter,
    sort: query.sort ? parseSortQuery(query.sort.toString()) : undefined,
  };
}

// Modified paginate function signature
export async function paginate<K extends keyof PrismaClient, T = any>({
  req,
  model,
  options,
  searchFields,
  selection,
  whereClause = {},
}: {
  req: Request;
  model: PrismaClient[K];
  options?: PaginationParams;
  searchFields?: string[];
  selection?: {
    include?: Record<string, any>;
    select?: Record<string, any>;
  };
  whereClause?: Record<string, any>;
}): Promise<PaginatedResult<T>> {
  if (!options) {
    options = parsePaginationQuery(req.query);
  }

  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  let finalWhere = { ...whereClause };

  // Search functionality
  if (options.search && searchFields && searchFields.length > 0) {
    const searchConditions = searchFields.map((field) => ({
      [field]: {
        contains: options.search,
        mode: 'insensitive',
      },
    }));
    finalWhere = {
      ...finalWhere,
      OR: searchConditions,
    };
  }

  // Filtering
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
    (model as any).count({
      where: finalWhere,
    }),
    (model as any).findMany({
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

// Keep the existing parseSortQuery
export function parseSortQuery(sortQuery: string): {
  field: string;
  direction: 'asc' | 'desc';
} {
  const [field, direction] = sortQuery.split(':');
  return {
    field,
    direction: direction === 'desc' ? 'desc' : 'asc',
  };
}
