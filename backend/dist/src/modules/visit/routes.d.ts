import { Router } from 'express';
import { VisitController } from './controllers/visit.controller.js';
import { VisitAnalyticsController } from './controllers/visit.analytics.controller.js';
/**
 * Creates and configures the visit routes
 * @param visitController - The VisitController instance
 * @returns The configured router
 */
export declare const createVisitRouter: (visitController: VisitController) => Router;
/**
 * Creates and configures the visit analytics routes
 * @param visitAnalyticsController - The VisitAnalyticsController instance
 * @returns The configured router
 */
export declare const createVisitAnalyticsRouter: (visitAnalyticsController: VisitAnalyticsController) => Router;
//# sourceMappingURL=routes.d.ts.map