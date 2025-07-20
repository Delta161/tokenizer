import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
export * from './types/visit.types.js';
export * from './types/visit.analytics.types.js';
export * from './validators/visit.validators.js';
export * from './validators/visit.analytics.validators.js';
/**
 * Initializes the visit module
 * @param prisma - The Prisma client instance
 * @returns The configured router
 */
export declare const initVisitModule: (prisma: PrismaClient) => {
    visitRouter: Router;
    analyticsRouter: Router;
};
//# sourceMappingURL=index.d.ts.map