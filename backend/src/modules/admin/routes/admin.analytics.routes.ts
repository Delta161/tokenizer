import { Router } from 'express';
import { AdminAnalyticsController } from '../controllers/admin.analytics.controller.js';
import { requireAuth, requireRole } from '../../accounts/middleware/auth.middleware.js';

export function createAdminAnalyticsRouter(adminAnalyticsController: AdminAnalyticsController): Router {
  const router = Router();

  // Apply authentication and admin role middleware to all routes
  router.use(requireAuth);
  router.use(requireRole('ADMIN'));

  // Analytics routes
  router.get('/summary', adminAnalyticsController.getSummary);
  router.get('/user-registrations', adminAnalyticsController.getUserRegistrations);
  router.get('/property-submissions', adminAnalyticsController.getPropertySubmissions);
  router.get('/visit-summary', adminAnalyticsController.getVisitSummary);
  router.get('/kyc-distribution', adminAnalyticsController.getKycStatusDistribution);

  return router;
}