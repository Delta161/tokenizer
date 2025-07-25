/**
 * Shared Prisma Client for Investment Module
 * Ensures a single instance of PrismaClient is used throughout the investment module
 */

// Import the centralized Prisma client
import { prisma } from '@/prisma/client';
import { logger } from '@/utils/logger';

// Log Prisma query events if in development environment
if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    
    logger.debug(`Prisma Query: ${params.model}.${params.action} took ${after - before}ms`);
    return result;
  });
}

// Re-export the centralized Prisma client
export { prisma };