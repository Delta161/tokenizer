import { PrismaClient } from '@prisma/client';
import { SummaryResponse, RegistrationsTrendDto, PropertySubmissionDto, VisitSummaryDto, KycDistributionDto, DateRangeQuery } from '../types/admin.analytics.types.js';
export declare class AdminAnalyticsService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Get platform-wide summary statistics
     */
    getPlatformSummary(): Promise<SummaryResponse>;
    /**
     * Get user registration trends over time
     */
    getUserRegistrationTrend(query: DateRangeQuery): Promise<RegistrationsTrendDto>;
    /**
     * Get property submission trends over time
     */
    getPropertySubmissionTrend(query: DateRangeQuery): Promise<PropertySubmissionDto>;
    /**
     * Get visit statistics summary
     */
    getVisitSummary(): Promise<VisitSummaryDto>;
    /**
     * Get KYC status distribution
     */
    getKycStatusDistribution(): Promise<KycDistributionDto>;
}
//# sourceMappingURL=admin.analytics.service.d.ts.map