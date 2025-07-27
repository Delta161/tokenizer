import { Router } from 'express';

// Audit module components
import { AnalyticsAuditService } from './services/analytics.audit.service.js';
import { AnalyticsAuditController } from './controllers/analytics.audit.controller.js';
export * from './types/analytics.audit.types.js';
export * from './validators/analytics.audit.validators.js';

// Flags module components
import { AnalyticsFlagsService } from './services/analytics.flags.service.js';
import { AnalyticsFlagsController } from './controllers/analytics.flags.controller.js';
export * from './types/analytics.flags.types.js';
export * from './validators/analytics.flags.validators.js';

// Visit module components
import { AnalyticsVisitService } from './services/analytics.visit.service.js';
import { AnalyticsVisitController } from './controllers/analytics.visit.controller.js';
import { AnalyticsVisitAnalyticsService } from './services/analytics.visit.analytics.service.js';
import { AnalyticsVisitAnalyticsController } from './controllers/analytics.visit.analytics.controller.js';
export * from './types/analytics.visit.types.js';
export * from './types/analytics.visit.analytics.types.js';
export * from './validators/analytics.visit.validators.js';
export * from './validators/analytics.visit.analytics.validators.js';

// Router imports
import { createAuditRouter } from './routes/analytics.routes.js';
import { createFlagsRouter } from './routes/analytics.routes.js';
import { createVisitRouter } from './routes/analytics.routes.js';
import { createVisitAnalyticsRouter } from './routes/analytics.routes.js';

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
 * @returns Object containing all routers for the analytics module
 */
export function initAnalyticsModule() {
  // Initialize services
  const auditService = new AnalyticsAuditService();
  const flagsService = new AnalyticsFlagsService();
  const visitService = new AnalyticsVisitService();
  const visitAnalyticsService = new AnalyticsVisitAnalyticsService();

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