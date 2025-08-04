/**
 * Pagination Middleware
 * Handles pagination query parameters for API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { PAGINATION } from '../config/constants';
import { PaginationOptions } from '../utils/pagination';

/**
 * Middleware to parse and validate pagination parameters
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const paginationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Parse page parameter
    let page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    if (isNaN(page) || page < 1) {
      page = PAGINATION.DEFAULT_PAGE;
    }

    // Parse limit parameter
    let limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
    if (isNaN(limit) || limit < 1) {
      limit = PAGINATION.DEFAULT_LIMIT;
    }
    if (limit > PAGINATION.MAX_LIMIT) {
      limit = PAGINATION.MAX_LIMIT;
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Attach pagination object to request
    req.pagination = { page, limit, skip } as PaginationOptions;

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid pagination parameters',
      message: 'Please provide valid page and limit values',
    });
  }
};

/**
 * Extend Express Request interface to include pagination
 */
declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationOptions;
    }
  }
}