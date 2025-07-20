export declare class AdminAnalyticsService {
    /**
     * Get platform-wide summary statistics
     */
    getSummary(): Promise<{
        users: {
            total: number;
            investors: number;
            clients: number;
            admins: number;
        };
        properties: {
            total: number;
            submitted: number;
            approved: number;
            rejected: number;
            tokenized: number;
        };
        tokens: {
            total: number;
        };
        investments: {
            total: number;
            totalAmount: number;
        };
    }>;
    /**
     * Get user registration trends over time
     */
    getUserRegistrations(dateFrom: Date, dateTo: Date): Promise<any[]>;
    /**
     * Get property submission trends over time
     */
    getPropertySubmissions(dateFrom: Date, dateTo: Date): Promise<any[]>;
    /**
     * Get visit statistics
     */
    getVisitSummary(dateFrom: Date, dateTo: Date): Promise<{
        totalVisits: number;
        uniqueVisitors: number;
        topPages: {
            page: any;
            count: any;
        }[];
        visitsByDate: {
            date: any;
            count: any;
        }[];
    }>;
    /**
     * Get KYC status distribution
     */
    getKycStatusDistribution(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    }>;
}
//# sourceMappingURL=admin.analytics.service.d.ts.map