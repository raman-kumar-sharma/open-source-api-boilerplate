import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from './constants.js';

const parsePaginationQuery = (query) => {
  const page = Math.max(parseInt(query.page, 10) || DEFAULT_PAGE, 1);
  let limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;
  limit = Math.min(Math.max(limit, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const search = query.search?.trim() || '';
  const searchFields = query.searchFields
    ? query.searchFields.split(',').map((f) => f.trim())
    : ['name', 'email'];

  const filter = {};
  Object.keys(query).forEach((key) => {
    if (!['page', 'limit', 'sortBy', 'sortOrder', 'search', 'searchFields'].includes(key)) {
      filter[key] = query[key];
    }
  });

  return { page, limit, skip, sort, search, searchFields, filter };
};

const buildPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const buildSearchFilter = (baseFilter, search, searchFields) => {
  if (!search) {
    return baseFilter;
  }

  const searchRegex = { $regex: search, $options: 'i' };
  const searchConditions = searchFields.map((field) => ({ [field]: searchRegex }));

  return {
    ...baseFilter,
    $or: searchConditions,
  };
};

export { parsePaginationQuery, buildPaginationMeta, buildSearchFilter };
