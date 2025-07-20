import { Router } from 'express';
import { optionalAuth, requireAuth } from '../auth/requireAuth.js';
/**
 * Creates and configures the visit routes
 * @param visitController - The VisitController instance
 * @returns The configured router
 */
export const createVisitRouter = (visitController) => {
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
export const createVisitAnalyticsRouter = (visitAnalyticsController) => {
    const router = Router();
    /**
     * @route GET /properties/:id/visits
     * @desc Get visit summary for a specific property
     * @access Private - INVESTOR role or higher
     */
    router.get('/properties/:id/visits', requireAuth, visitAnalyticsController.getPropertyVisits);
    /**
     * @route GET /clients/:id/visits
     * @desc Get visit breakdown for a client's properties
     * @access Private - Admin or client owner
     */
    router.get('/clients/:id/visits', requireAuth, visitAnalyticsController.getClientVisits);
    /**
     * @route GET /trending
     * @desc Get trending properties (most visited in the last 7 days)
     * @access Private - INVESTOR role or higher
     */
    router.get('/trending', requireAuth, visitAnalyticsController.getTrendingProperties);
    return router;
};
//# sourceMappingURL=routes.js.map