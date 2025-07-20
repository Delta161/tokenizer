/**
 * Pagination Utility
 * Handles pagination for API responses
 */
import { PAGINATION } from '../config/constants';
/**
 * Get pagination options from request query parameters
 */
export const getPaginationOptions = (req) => {
    const page = Math.max(1, parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
/**
 * Create pagination result
 */
export const createPaginationResult = (data, total, options) => {
    const { page, limit } = options;
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
};
//# sourceMappingURL=pagination.js.map