import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { VisitService } from './services/visit.service.js';
import { VisitController } from './controllers/visit.controller.js';
import { VisitAnalyticsService } from './services/visit.analytics.service.js';
import { VisitAnalyticsController } from './controllers/visit.analytics.controller.js';
import { createVisitRouter, createVisitAnalyticsRouter } from './routes.js';

// Export types for external use
export * from './types/visit.types.js';
export * from './types/visit.analytics.types.js';

// Export validators for external use
export * from './validators/visit.validators.js';
export * from './validators/visit.analytics.validators.js';

/**
 * Initializes the visit module
 * @param prisma - The Prisma client instance
 * @returns The configured router
 */
export const initVisitModule = (prisma: PrismaClient): { visitRouter: Router; analyticsRouter: Router } => {
  // Initialize services
  const visitService = new VisitService(prisma);
  const visitAnalyticsService = new VisitAnalyticsService(prisma);

  // Initialize controllers
  const visitController = new VisitController(visitService);
  const visitAnalyticsController = new VisitAnalyticsController(visitAnalyticsService);

  // Create routers
  const visitRouter = createVisitRouter(visitController);
  const analyticsRouter = createVisitAnalyticsRouter(visitAnalyticsController);

  return { visitRouter, analyticsRouter };
};