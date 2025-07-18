import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { VisitService } from './services/visit.service.js';
import { VisitController } from './controllers/visit.controller.js';
import { createVisitRouter } from './routes/visit.routes.js';
import { VisitAnalyticsService } from './services/visit.analytics.service.js';
import { VisitAnalyticsController } from './controllers/visit.analytics.controller.js';
import { createVisitAnalyticsRouter } from './routes/visit.analytics.routes.js';

/**
 * Initializes the Visit module
 * @param prisma - The Prisma client instance
 * @returns Object containing the module's components
 */
export const initVisitModule = (prisma: PrismaClient) => {
  // Initialize the services
  const visitService = new VisitService(prisma);
  const visitAnalyticsService = new VisitAnalyticsService(prisma);
  
  // Initialize the controllers with the services
  const visitController = new VisitController(visitService);
  const visitAnalyticsController = new VisitAnalyticsController(visitAnalyticsService);
  
  // Create the routers with the controllers
  const visitRouter = createVisitRouter(visitController);
  const visitAnalyticsRouter = createVisitAnalyticsRouter(visitAnalyticsController);
  
  return {
    service: visitService,
    analyticsService: visitAnalyticsService,
    controller: visitController,
    analyticsController: visitAnalyticsController,
    router: visitRouter,
    analyticsRouter: visitAnalyticsRouter,
  };
};

/**
 * Mounts the Visit module routes to the provided Express router
 * @param router - The Express router to mount the routes on
 * @param prisma - The Prisma client instance
 * @returns The router with mounted visit routes
 */
export const mountVisitRoutes = (router: Router, prisma: PrismaClient): Router => {
  const { router: visitRouter, analyticsRouter } = initVisitModule(prisma);
  
  // Mount the visit routes at /visits
  router.use('/visits', visitRouter);
  
  // Mount the analytics routes
  router.use('/analytics', analyticsRouter);
  
  return router;
};

// Export types and validators for external use
export * from './types/visit.types.js';
export * from './types/visit.analytics.types.js';
export * from './validators/visit.validators.js';
export * from './validators/visit.analytics.validators.js';