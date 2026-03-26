import { Prisma } from '@prisma/client';

type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'in'
  | 'between';

interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: Prisma.JsonValue;
}

export class FilterBuilder {
  static buildWhereClause(filters: FilterCondition[]): Prisma.JsonObject {
    const whereClause: Prisma.JsonObject = {};

    for (const filter of filters) {
      const { field, operator, value } = filter;

      switch (operator) {
        case 'eq':
          whereClause[field] = value;
          break;
        case 'neq':
          whereClause[field] = { not: value };
          break;
        case 'gt':
          whereClause[field] = { gt: value };
          break;
        case 'gte':
          whereClause[field] = { gte: value };
          break;
        case 'lt':
          whereClause[field] = { lt: value };
          break;
        case 'lte':
          whereClause[field] = { lte: value };
          break;
        case 'contains':
          whereClause[field] = { contains: value, mode: 'insensitive' };
          break;
        case 'in':
          whereClause[field] = { in: value };
          break;
        case 'between':
          if (Array.isArray(value)) {
            whereClause[field] = {
              gte: value[0],
              lte: value[1],
            };
          }
          break;
      }
    }

    return whereClause;
  }

  static buildOrderByClause(
    sortFields: { field: string; direction: 'asc' | 'desc' }[]
  ): Prisma.JsonObject {
    const orderBy: Prisma.JsonObject = {};

    for (const sort of sortFields) {
      orderBy[sort.field] = sort.direction;
    }

    return orderBy;
  }
}
