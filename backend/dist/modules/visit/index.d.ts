import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { VisitService } from './services/visit.service.js';
import { VisitController } from './controllers/visit.controller.js';
import { VisitAnalyticsService } from './services/visit.analytics.service.js';
import { VisitAnalyticsController } from './controllers/visit.analytics.controller.js';
/**
 * Initializes the Visit module
 * @param prisma - The Prisma client instance
 * @returns Object containing the module's components
 */
export declare const initVisitModule: (prisma: PrismaClient) => {
    service: VisitService;
    analyticsService: VisitAnalyticsService;
    controller: VisitController;
    analyticsController: VisitAnalyticsController;
    router: Router;
    analyticsRouter: Router;
};
/**
 * Mounts the Visit module routes to the provided Express router
 * @param router - The Express router to mount the routes on
 * @param prisma - The Prisma client instance
 * @returns The router with mounted visit routes
 */
export declare const mountVisitRoutes: (router: Router, prisma: PrismaClient) => Router;
export * from './types/visit.types.js';
export * from './types/visit.analytics.types.js';
export * from './validators/visit.validators.js';
export * from './validators/visit.analytics.validators.js';
//# sourceMappingURL=index.d.ts.map