import {
  createPaginatedResponse,
  parsePaginationParams,
  applyPagination,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
} from './pagination';

describe('pagination utilities', () => {
  // ─── constants ──────────────────────────────────────────────────────────

  it('DEFAULT_PAGE is 1', () => {
    expect(DEFAULT_PAGE).toBe(1);
  });

  it('DEFAULT_LIMIT is 20', () => {
    expect(DEFAULT_LIMIT).toBe(20);
  });

  // ─── createPaginatedResponse ─────────────────────────────────────────────

  it('createPaginatedResponse builds a paginated result object', () => {
    const items = ['a', 'b', 'c'];
    const result = createPaginatedResponse(items, 30, 2, 10);

    expect(result).toEqual({
      data: items,
      total: 30,
      page: 2,
      limit: 10,
      totalPages: 3,
    });
  });

  it('createPaginatedResponse rounds up totalPages', () => {
    const result = createPaginatedResponse([], 25, 1, 10);

    expect(result.totalPages).toBe(3); // Math.ceil(25 / 10)
  });

  it('createPaginatedResponse handles zero total', () => {
    const result = createPaginatedResponse([], 0, 1, 10);

    expect(result.totalPages).toBe(0);
    expect(result.data).toEqual([]);
  });

  // ─── parsePaginationParams ────────────────────────────────────────────────

  it('parsePaginationParams parses page and limit from params', () => {
    const params = {
      get: (name: string) => (name === 'page' ? '3' : name === 'limit' ? '15' : null),
    };

    const result = parsePaginationParams(params);

    expect(result.page).toBe(3);
    expect(result.limit).toBe(15);
  });

  it('parsePaginationParams uses defaults when params are missing', () => {
    const params = { get: (_name: string) => null };

    const result = parsePaginationParams(params);

    expect(result.page).toBe(DEFAULT_PAGE);
    expect(result.limit).toBe(DEFAULT_LIMIT);
  });

  // ─── applyPagination ──────────────────────────────────────────────────────

  it('applyPagination returns the correct slice for page 1', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const result = applyPagination(items, 1, 3);

    expect(result).toEqual([1, 2, 3]);
  });

  it('applyPagination returns the correct slice for page 2', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const result = applyPagination(items, 2, 3);

    expect(result).toEqual([4, 5, 6]);
  });

  it('applyPagination returns partial last page', () => {
    const items = [1, 2, 3, 4, 5];

    const result = applyPagination(items, 2, 3);

    expect(result).toEqual([4, 5]);
  });

  it('applyPagination returns empty array when page is out of range', () => {
    const items = [1, 2, 3];

    const result = applyPagination(items, 5, 3);

    expect(result).toEqual([]);
  });
});
