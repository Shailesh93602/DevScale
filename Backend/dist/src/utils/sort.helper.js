"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSortQuery = parseSortQuery;
// utils/sort-helper.ts
function parseSortQuery(sortQuery) {
    if (!sortQuery)
        return undefined;
    const [field, direction] = sortQuery.split(':');
    return {
        field,
        direction: direction === 'desc' ? 'desc' : 'asc',
    };
}
//# sourceMappingURL=sort.helper.js.map