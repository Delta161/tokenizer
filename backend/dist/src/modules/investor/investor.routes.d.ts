import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
/**
 * Creates and configures the investor routes
 * @param prisma PrismaClient instance for database access
 * @returns Configured Express router
 */
export declare function createInvestorRoutes(prisma?: PrismaClient): Router;
export declare const investorRoutes: Router;
//# sourceMappingURL=investor.routes.d.ts.map