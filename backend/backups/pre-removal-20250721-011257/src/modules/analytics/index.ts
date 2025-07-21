import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

// Audit module components
import { AnalyticsAuditService } from './analytics.audit.service.js';
import { AnalyticsAuditController } from './analytics.audit.controller.js';
export * from './analytics.audit.types.js';
export * from './analytics.audit.validators.js';

// Flags module components
import { AnalyticsFlagsService } from './analytics.flags.service.js';
import { AnalyticsFlagsController } from './analytics.flags.controller.js';
export * from './analytics.flags.types.js';
export * from './analytics.flags.validators.js';

// Visit module components
import { AnalyticsVisitService } from './analytics.visit.service.js';
import { AnalyticsVisitController } from './analytics.visit.controller.js';
import { AnalyticsVisitAnalyticsService } from './analytics.visit.analytics.service.js';
import { AnalyticsVisitAnalyticsController } from './analytics.visit.analytics.controller.js';
export * from './analytics.visit.types.js';
export * from './analytics.visit.analytics.types.js';
export * from './analytics.visit.validators.js';
export * from './analytics.visit.analytics.validators.js';

// Router imports
import { createAuditRouter } from './analytics.routes.js';
import { createFlagsRouter } from './analytics.routes.js';
import { createVisitRouter } from './analytics.routes.js';
import { createVisitAnalyticsRouter } from './analytics.routes.js';

// Export services and controllers
export { 
  AnalyticsAuditService, 
  AnalyticsAuditController,
  AnalyticsFlagsService,
  AnalyticsFlagsController,
  AnalyticsVisitService,
  AnalyticsVisitController,
  AnalyticsVisitAnalyticsService,
  AnalyticsVisitAnalyticsController
};

/**
 * Initialize the analytics module
 * @param prisma - The Prisma client instance
 * @returns Object containing all routers for the analytics module
 */
export function initAnalyticsModule(prisma: PrismaClient) {
  // Initialize services
  const auditService = new AnalyticsAuditService(prisma);
  const flagsService = new AnalyticsFlagsService(prisma);
  const visitService = new AnalyticsVisitService(prisma);
  const visitAnalyticsService = new AnalyticsVisitAnalyticsService(prisma);

  // Initialize controllers
  const auditController = new AnalyticsAuditController(auditService);
  const flagsController = new AnalyticsFlagsController(flagsService);
  const visitController = new AnalyticsVisitController(visitService);
  const visitAnalyticsController = new AnalyticsVisitAnalyticsController(visitAnalyticsService);

  // Create routers
  const auditRouter = createAuditRouter(auditController);
  const flagsRouter = createFlagsRouter(flagsController);
  const visitRouter = createVisitRouter(visitController);
  const visitAnalyticsRouter = createVisitAnalyticsRouter(visitAnalyticsController);

  return {
    auditRouter,
    flagsRouter,
    visitRouter,
    visitAnalyticsRouter
  };
}