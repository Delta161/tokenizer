import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
/**
 * Create client routes with proper middleware
 * @param prisma - Prisma client instance
 * @returns Express router with client routes
 */
export declare function createClientRoutes(prisma: PrismaClient): Router;
/**
 * Default export for convenience
 */
export default createClientRoutes;
//# sourceMappingURL=client.routes.d.ts.map