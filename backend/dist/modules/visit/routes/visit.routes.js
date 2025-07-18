import { Router } from 'express';
import { optionalAuth } from '../../auth/requireAuth.js';
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
//# sourceMappingURL=visit.routes.js.map