import { Response } from 'express';
import { AuthenticatedRequest } from '../../accounts/types/auth.types.js';
import { VisitAnalyticsService } from '../services/visit.analytics.service.js';
export declare class VisitAnalyticsController {
    private visitAnalyticsService;
    constructor(visitAnalyticsService: VisitAnalyticsService);
    /**
     * Get visit summary for a specific property
     */
    getPropertyVisits: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Get visit breakdown for a client's properties
     */
    getClientVisits: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Get trending properties (most visited in the last 7 days)
     */
    getTrendingProperties: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Helper method to check if a user is the owner of a client
     */
    private isClientOwner;
}
//# sourceMappingURL=visit.analytics.controller.d.ts.map