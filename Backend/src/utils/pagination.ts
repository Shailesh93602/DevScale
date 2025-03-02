/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/pagination.ts

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
export async function paginate<T>(
  model: any,
  options: PaginationParams,
  searchFields?: string[],
  selectFields?: string[]
): Promise<PaginatedResult<T>> {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  // Search functionality
  if (options.search && searchFields && searchFields.length > 0) {
    where.OR = searchFields.map((field) => ({
      [field]: {
        contains: options.search,
        mode: 'insensitive',
      },
    }));
  }

  // Filtering
  if (options.filter) {
    where.AND = Object.keys(options.filter).map((key) => ({
      [key]: options.filter?.[key],
    }));
  }

  // Sorting
  const orderBy = options.sort
    ? {
        [options.sort.field]: options.sort.direction,
      }
    : undefined;

  const [total, data] = await Promise.all([
    model.count({ where }),
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy,

      ...(selectFields?.length
        ? {
            select: {
              ...selectFields.map((field) => ({ [field]: true })),
            },
          }
        : {}),
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: data as T[],
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
