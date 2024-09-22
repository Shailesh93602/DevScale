const paginationMiddleware = (req, res, next) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  if (page < 1) page = 1;
  if (limit < 1) limit = 10;

  const offset = (page - 1) * limit;

  const search = req.query.search || "";
  const order = req.query.order?.toLowerCase() === "desc" ? "DESC" : "ASC";
  const orderBy = req.query.orderBy || "createdAt";

  req.pagination = { limit, offset, page, search, order, orderBy };

  next();
};

export default paginationMiddleware;
