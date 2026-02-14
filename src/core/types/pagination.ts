/**
 * Pagination request parameters
 * Generic interface for paginated requests
 */
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  role?: string;
}

/**
 * Paginated response wrapper
 * Generic response for paginated data from API
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Helper to parse pagination params from HTTP request params
 */
export function parsePaginationParams(params: {
  get(name: string): string | null;
}): PaginationParams {
  return {
    page: parseInt(params.get('page') || String(DEFAULT_PAGE)),
    limit: parseInt(params.get('limit') || String(DEFAULT_LIMIT)),
  };
}

/**
 * Apply pagination to array
 */
export function applyPagination<T>(
  items: T[],
  page: number,
  limit: number,
): T[] {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return items.slice(startIndex, endIndex);
}

