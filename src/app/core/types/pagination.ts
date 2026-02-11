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
