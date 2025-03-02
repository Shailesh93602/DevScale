"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterBuilder = void 0;
class FilterBuilder {
    static buildWhereClause(filters) {
        const whereClause = {};
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
                    whereClause[field] = {
                        gte: value[0],
                        lte: value[1],
                    };
                    break;
            }
        }
        return whereClause;
    }
    static buildOrderByClause(sortFields) {
        const orderBy = {};
        for (const sort of sortFields) {
            orderBy[sort.field] = sort.direction;
        }
        return orderBy;
    }
}
exports.FilterBuilder = FilterBuilder;
//# sourceMappingURL=filterBuilder.js.map