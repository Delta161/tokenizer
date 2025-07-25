/**
 * Pagination Utility
 * Handles pagination for API responses
 */

import { Request } from 'express';
import { PAGINATION } from '../config/constants';

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
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  error?: string;
  message?: string;
}

/**
 * Get pagination options from request query parameters
 */
export const getPaginationOptions = (req: Request): PaginationOptions => {
  const page = Math.max(1, parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Calculate skip value from page and limit
 */
export const getSkipValue = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Create pagination result
 */
export const createPaginationResult = <T>(
  data: T[],
  total: number,
  options: PaginationOptions
): PaginationResult<T> => {
  const { page, limit } = options;
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    meta: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Calculate pagination metadata
 */
export const calculatePaginationMeta = (
  page: number,
  limit: number,
  totalItems: number
): PaginationMeta => {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};