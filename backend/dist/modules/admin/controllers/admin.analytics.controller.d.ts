import { Request, Response } from 'express';
import { AdminAnalyticsService } from '../services/admin.analytics.service.js';
export declare class AdminAnalyticsController {
    private adminAnalyticsService;
    constructor(adminAnalyticsService: AdminAnalyticsService);
    /**
     * Get platform overview summary
     */
    getSummary: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Get user registration trends
     */
    getUserRegistrations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Get property submission trends
     */
    getPropertySubmissions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Get visit statistics summary
     */
    getVisitSummary: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Get KYC status distribution
     */
    getKycStatusDistribution: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=admin.analytics.controller.d.ts.map