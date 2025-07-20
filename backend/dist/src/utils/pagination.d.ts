/**
 * Pagination Utility
 * Handles pagination for API responses
 */
import { Request } from 'express';
/**
 * Pagination options interface
 */
export interface PaginationOptions {
    page: number;
    limit: number;
    skip: number;
}
/**
 * Pagination result interface
 */
export interface PaginationResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}
/**
 * Get pagination options from request query parameters
 */
export declare const getPaginationOptions: (req: Request) => PaginationOptions;
/**
 * Create pagination result
 */
export declare const createPaginationResult: <T>(data: T[], total: number, options: PaginationOptions) => PaginationResult<T>;
//# sourceMappingURL=pagination.d.ts.map