"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/pagination.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationQuery = parsePaginationQuery;
exports.paginate = paginate;
exports.parseSortQuery = parseSortQuery;
// Add this interface for parsed query parameters
// Add this query parser helper
function parsePaginationQuery(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
query) {
    return {
        page: Math.max(1, parseInt(query.page) || 1),
        limit: Math.min(100, Math.max(1, parseInt(query.limit) || 10)),
        search: query.search?.toString(),
        filter: typeof query.filter === 'string'
            ? JSON.parse(query.filter)
            : query.filter,
        sort: query.sort ? parseSortQuery(query.sort.toString()) : undefined,
    };
}
// Modified paginate function signature
async function paginate({ req, model, options, searchFields, selection, whereClause = {}, }) {
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
        model.count({
            where: finalWhere,
        }),
        model.findMany({
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
function parseSortQuery(sortQuery) {
    const [field, direction] = sortQuery.split(':');
    return {
        field,
        direction: direction === 'desc' ? 'desc' : 'asc',
    };
}
//# sourceMappingURL=pagination.js.map