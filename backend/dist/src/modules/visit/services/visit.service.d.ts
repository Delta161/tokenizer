import { PrismaClient, Visit } from '@prisma/client';
import { CreateVisitDto } from '../types/visit.types.js';
/**
 * Service class for handling visit-related operations
 */
export declare class VisitService {
    private prisma;
    private readonly RATE_LIMIT_MINUTES;
    /**
     * Creates a new instance of VisitService
     * @param prisma - The Prisma client instance
     */
    constructor(prisma: PrismaClient);
    /**
     * Creates a new visit record if it doesn't violate rate limiting
     * @param visitData - The visit data to create
     * @returns The created visit or null if rate limited
     */
    createVisit(visitData: CreateVisitDto): Promise<Visit | null>;
    /**
     * Finds a recent visit from the same user/IP to the same property
     * @param propertyId - The property ID
     * @param userId - The user ID (optional)
     * @param ipAddress - The IP address (optional)
     * @returns The most recent visit or null if none found
     */
    private findRecentVisit;
}
//# sourceMappingURL=visit.service.d.ts.map