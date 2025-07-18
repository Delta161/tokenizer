import { Router } from 'express';
import { VisitController } from '../controllers/visit.controller.js';
import { optionalAuth } from '../../auth/requireAuth.js';

/**
 * Creates and configures the visit routes
 * @param visitController - The VisitController instance
 * @returns The configured router
 */
export const createVisitRouter = (visitController: VisitController): Router => {
  const router = Router();

  /**
   * POST /visits
   * Creates a new visit record
   * Authentication is optional - will track both authenticated and anonymous visits
   */
  router.post('/', optionalAuth, visitController.createVisit);

  return router;
};