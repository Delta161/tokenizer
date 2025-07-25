/**
 * Pagination Types
 * Standardized types for pagination across the application
 */

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Sorting parameters interface
 */
export interface SortingParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination options interface
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Pagination result interface
 */
export interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
}