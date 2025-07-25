/**
 * Pagination Example
 * Demonstrates how to use the standardized pagination system
 */

import { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PAGINATION } from '@config/constants';
import { paginationMiddleware } from '@middleware/pagination';
import { createPaginationResult, getSkipValue } from '@utils/pagination';
import { z } from 'zod';

// Example model service
class ExampleService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get items with pagination and filtering
   */
  async getItems(options: {
    page: number;
    limit: number;
    filter?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, filter, sortBy, sortOrder } = options;
    const skip = getSkipValue(page, limit);

    // Build where clause based on filter
    const where = filter ? { name: { contains: filter } } : {};

    // Build order by clause
    const orderBy = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    // Execute queries in parallel for better performance
    const [items, total] = await Promise.all([
      this.prisma.example.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.example.count({ where }),
    ]);

    return { items, total };
  }
}

// Example controller
class ExampleController {
  constructor(private service: ExampleService) {}

  /**
   * Get items with pagination and filtering
   * Using the pagination middleware
   */
  getItemsWithMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // The pagination middleware has already parsed and validated pagination parameters
      // and attached them to req.pagination
      const { page, limit, skip } = req.pagination!;

      // Parse other query parameters
      const filter = req.query.filter as string | undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

      // Get items with pagination
      const { items, total } = await this.service.getItems({
        page,
        limit,
        filter,
        sortBy,
        sortOrder,
      });

      // Create standardized pagination result
      const result = createPaginationResult(items, total, { page, limit, skip });

      // Return response
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get items with pagination and filtering
   * Using Zod for validation
   */
  getItemsWithZod = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Define query schema with Zod
      const querySchema = z.object({
        page: z.coerce.number().int().positive().optional().default(PAGINATION.DEFAULT_PAGE),
        limit: z.coerce.number().int().positive().max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
        filter: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
      });

      // Validate query parameters
      const validatedQuery = querySchema.parse(req.query);
      const { page, limit, filter, sortBy, sortOrder } = validatedQuery;

      // Get items with pagination
      const { items, total } = await this.service.getItems({
        page,
        limit,
        filter,
        sortBy,
        sortOrder,
      });

      // Calculate skip value
      const skip = getSkipValue(page, limit);

      // Create standardized pagination result
      const result = createPaginationResult(items, total, { page, limit, skip });

      // Return response
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

// Example router setup
export function createExampleRouter(prisma: PrismaClient): Router {
  const router = Router();
  const service = new ExampleService(prisma);
  const controller = new ExampleController(service);

  // Route using pagination middleware
  router.get('/with-middleware', paginationMiddleware, controller.getItemsWithMiddleware);

  // Route using Zod validation
  router.get('/with-zod', controller.getItemsWithZod);

  return router;
}