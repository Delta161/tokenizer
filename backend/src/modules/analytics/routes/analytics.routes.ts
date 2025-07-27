import { Router } from 'express';
import { AnalyticsAuditController } from '../controllers/analytics.audit.controller.js';
import { AnalyticsFlagsController } from '../controllers/analytics.flags.controller.js';
import { AnalyticsVisitController } from '../controllers/analytics.visit.controller.js';
import { AnalyticsVisitAnalyticsController } from '../controllers/analytics.visit.analytics.controller.js';
import { requireAuth, optionalAuth, requireRole } from '../../../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../../../middleware/validation.middleware.js';
import { UpdateFlagSchema, FlagKeyParamSchema } from '../validators/analytics.flags.validators.js';

/**
 * Creates and configures the audit routes
 * @param auditController - The AuditController instance
 * @returns The configured router
 */
export const createAuditRouter = (auditController: AnalyticsAuditController): Router => {
  const router = Router();

  // Get audit logs with filtering options
  router.get('/', requireAuth, requireRole(['ADMIN']), auditController.getAuditLogs);

  // Get audit log by ID
  router.get('/:id', requireAuth, requireRole(['ADMIN']), auditController.getAuditLogById);

  return router;
};

/**
 * Creates and configures the flags routes
 * @param flagsController - The FlagsController instance
 * @returns The configured router
 */
export const createFlagsRouter = (flagsController: AnalyticsFlagsController): Router => {
  const router = Router();

  // Admin CRUD for flags
  router.get(
    '/admin/flags',
    requireAuth,
    requireRole(['ADMIN']),
    flagsController.getAll
  );
  
  router.patch(
    '/admin/flags/:key',
    requireAuth,
    requireRole(['ADMIN']),
    validateParams(FlagKeyParamSchema),
    validateBody(UpdateFlagSchema),
    flagsController.update
  );

  // Client-facing read endpoint
  router.get(
    '/flags',
    requireAuth,
    flagsController.getAll
  );

  return router;
};

/**
 * Creates and configures the visit routes
 * @param visitController - The VisitController instance
 * @returns The configured router
 */
export const createVisitRouter = (visitController: AnalyticsVisitController): Router => {
  const router = Router();

  /**
   * POST /visits
   * Creates a new visit record
   * Authentication is optional - will track both authenticated and anonymous visits
   */
  router.post('/', optionalAuth, visitController.createVisit);

  return router;
};

/**
 * Creates and configures the visit analytics routes
 * @param visitAnalyticsController - The VisitAnalyticsController instance
 * @returns The configured router
 */
export const createVisitAnalyticsRouter = (visitAnalyticsController: AnalyticsVisitAnalyticsController): Router => {
  const router = Router();

  /**
   * @route GET /properties/:id/visits
   * @desc Get visit summary for a specific property
   * @access Private - INVESTOR role or higher
   */
  router.get('/properties/:id/visits', 
    requireAuth,
    visitAnalyticsController.getPropertyVisits
  );

  /**
   * @route GET /clients/:id/visits
   * @desc Get visit breakdown for a client's properties
   * @access Private - Admin or client owner
   */
  router.get('/clients/:id/visits', 
    requireAuth,
    visitAnalyticsController.getClientVisits
  );

  /**
   * @route GET /trending
   * @desc Get trending properties (most visited in the last 7 days)
   * @access Private - INVESTOR role or higher
   */
  router.get('/trending', 
    requireAuth,
    visitAnalyticsController.getTrendingProperties
  );

  return router;
};