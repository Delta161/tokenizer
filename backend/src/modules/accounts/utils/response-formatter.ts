/**
 * Response Formatter Utility
 * Provides standardized response formatting for all controllers
 */

import { PaginationMeta } from '../../../utils/pagination';

/**
 * Standard success response interface
 */
export interface StandardResponse<T> {
  success: true;
  data: T;
  message: string;
  meta: {
    timestamp: string;
    pagination?: PaginationMeta;
  };
}

/**
 * Creates a standardized success response object
 * 
 * @param data The data to include in the response
 * @param message A success message
 * @param paginationMeta Optional pagination metadata
 * @returns A standardized response object
 */
export function createSuccessResponse<T>(
  data: T,
  message: string,
  paginationMeta?: PaginationMeta
): StandardResponse<T> {
  return {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      ...(paginationMeta ? { pagination: paginationMeta } : {})
    }
  };
}

/**
 * Creates a standardized paginated success response
 * 
 * @param data The data array to include in the response
 * @param message A success message
 * @param paginationMeta Pagination metadata
 * @returns A standardized paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  message: string,
  paginationMeta: PaginationMeta
): StandardResponse<T[]> {
  return createSuccessResponse(data, message, paginationMeta);
}

/**
 * Creates a standardized empty success response (for 204 equivalents)
 * 
 * @param message A success message
 * @returns A standardized response object with null data
 */
export function createEmptySuccessResponse(
  message: string
): StandardResponse<null> {
  return createSuccessResponse(null, message);
}

/**
 * Standard error response interface
 */
export interface StandardErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    timestamp: string;
  };
}

/**
 * Creates a standardized error response object
 * 
 * @param code Error code
 * @param message Error message
 * @param details Optional error details
 * @returns A standardized error response object
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown
): StandardErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };
}
