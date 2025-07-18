import { PrismaClient } from '@prisma/client';
import { PropertyVisitSummary, ClientVisitBreakdown, TrendingProperty } from '../types/visit.analytics.types.js';
export declare class VisitAnalyticsService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Get visit summary for a specific property
     */
    getPropertyVisitSummary(propertyId: string, range?: string): Promise<PropertyVisitSummary | null>;
    /**
     * Get visit breakdown for a client's properties
     */
    getClientVisitBreakdown(clientId: string): Promise<ClientVisitBreakdown | null>;
    /**
     * Get trending properties (most visited in the last 7 days)
     */
    getTrendingProperties(limit?: number): Promise<TrendingProperty[]>;
    /**
     * Helper method to get daily visit counts for a property
     */
    private getDailyVisitCounts;
    /**
     * Format date as YYYY-MM-DD
     */
    private formatDate;
}
//# sourceMappingURL=visit.analytics.service.d.ts.map