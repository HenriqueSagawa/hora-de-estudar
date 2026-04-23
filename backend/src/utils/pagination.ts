import { PaginatedResponse, PaginationParams } from '../types/common';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export function parsePagination(query: {
  page?: string | number;
  pageSize?: string | number;
}): PaginationParams {
  let page = Number(query.page) || DEFAULT_PAGE;
  let pageSize = Number(query.pageSize) || DEFAULT_PAGE_SIZE;

  if (page < 1) page = DEFAULT_PAGE;
  if (pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

  return { page, pageSize };
}

export function buildPaginationQuery(params: PaginationParams) {
  return {
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
  };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    items,
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.ceil(total / params.pageSize),
  };
}
