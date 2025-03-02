"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paginationMiddleware = (req, res, next) => {
    let page = parseInt(String(req.query.page)) ?? 1;
    let limit = parseInt(String(req.query.limit)) ?? 10;
    if (page < 1)
        page = 1;
    if (limit < 1)
        limit = 10;
    const offset = (page - 1) * limit;
    const search = String(req.query.search);
    const order = String(req.query.order)?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const orderBy = String(req.query.orderBy ?? 'createdAt');
    req.pagination = { limit, offset, page, search, order, orderBy };
    next();
};
exports.default = paginationMiddleware;
//# sourceMappingURL=paginationMiddleware.js.map