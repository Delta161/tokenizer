import { Router } from 'express';
import { requireAuth } from '../../auth/middleware/requireAuth.js';
import { requireAdmin } from '../../auth/middleware/requireRole.js';
export const createAdminAnalyticsRouter = (adminAnalyticsController) => {
    const router = Router();
    // Apply authentication and admin role middleware to all routes
    router.use(requireAuth, requireAdmin);
    // Platform overview
    router.get('/summary', adminAnalyticsController.getSummary);
    // User registrations
    router.get('/users/registrations', adminAnalyticsController.getUserRegistrations);
    // Property submissions
    router.get('/properties/submissions', adminAnalyticsController.getPropertySubmissions);
    // Visit statistics
    router.get('/visits/summary', adminAnalyticsController.getVisitSummary);
    // KYC status distribution
    router.get('/kyc-status', adminAnalyticsController.getKycStatusDistribution);
    return router;
};
//# sourceMappingURL=admin.analytics.routes.js.map