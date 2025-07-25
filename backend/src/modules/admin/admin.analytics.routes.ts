import { Router } from 'express';
import { AdminAnalyticsController } from './admin.analytics.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

export function createAdminAnalyticsRouter(adminAnalyticsController: AdminAnalyticsController): Router {
  const router = Router();

  // Apply authentication and admin role middleware to all routes
  router.use(requireAuth);
  router.use(requireRole('ADMIN'));

  // Analytics routes
  router.get('/summary', adminAnalyticsController.getSummary.bind(adminAnalyticsController));
  router.get('/user-registrations', adminAnalyticsController.getUserRegistrations.bind(adminAnalyticsController));
  router.get('/property-submissions', adminAnalyticsController.getPropertySubmissions.bind(adminAnalyticsController));
  router.get('/visit-summary', adminAnalyticsController.getVisitSummary.bind(adminAnalyticsController));
  router.get('/kyc-distribution', adminAnalyticsController.getKycStatusDistribution.bind(adminAnalyticsController));

  return router;
}