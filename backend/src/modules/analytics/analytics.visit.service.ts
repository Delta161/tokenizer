import { PrismaClient, Visit } from '@prisma/client';
import { CreateVisitDto } from './analytics.visit.types.js';
import { prisma as sharedPrisma } from './utils/prisma';

/**
 * Service class for handling visit-related operations
 */
export class AnalyticsVisitService {
  private prisma: PrismaClient;
  private readonly RATE_LIMIT_MINUTES = 30; // Rate limit window in minutes

  /**
   * Creates a new instance of VisitService
   * @param prisma - The Prisma client instance
   */
  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || sharedPrisma;
  }

  /**
   * Creates a new visit record if it doesn't violate rate limiting
   * @param visitData - The visit data to create
   * @returns The created visit or null if rate limited
   */
  async createVisit(visitData: CreateVisitDto): Promise<Visit | null> {
    // First, check if the property exists
    const property = await this.prisma.property.findUnique({
      where: { id: visitData.propertyId },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Check for existing recent visits from the same user/IP to the same property
    const existingVisit = await this.findRecentVisit(
      visitData.propertyId,
      visitData.userId,
      visitData.ipAddress
    );

    // If a recent visit exists, don't create a new one (rate limiting)
    if (existingVisit) {
      return null; // Rate limited
    }

    // Create the new visit record
    return this.prisma.visit.create({
      data: visitData,
    });
  }

  /**
   * Finds a recent visit from the same user/IP to the same property
   * @param propertyId - The property ID
   * @param userId - The user ID (optional)
   * @param ipAddress - The IP address (optional)
   * @returns The most recent visit or null if none found
   */
  private async findRecentVisit(
    propertyId: string,
    userId?: string,
    ipAddress?: string
  ): Promise<Visit | null> {
    // We need either a userId or ipAddress to check for rate limiting
    if (!userId && !ipAddress) {
      return null;
    }

    // Build the where clause based on available data
    const whereClause: any = {
      propertyId,
    };

    // If we have a userId, use that for identifying the visitor
    if (userId) {
      whereClause.userId = userId;
    }
    // Otherwise, use IP address for anonymous visitors
    else if (ipAddress) {
      whereClause.ipAddress = ipAddress;
    }

    // Find the most recent visit that matches our criteria
    const recentVisit = await this.prisma.visit.findFirst({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check if the visit is within our time window
    if (!recentVisit || !this.isWithinTimeWindow(recentVisit.createdAt, this.RATE_LIMIT_MINUTES)) {
      return null;
    }

    return recentVisit;
  }

  /**
   * Checks if a date is within a specified time window from now
   * @param date - The date to check
   * @param minutes - The time window in minutes
   * @returns True if the date is within the time window, false otherwise
   */
  private isWithinTimeWindow(date: Date, minutes: number): boolean {
    const now = new Date();
    const windowStart = new Date(now.getTime() - minutes * 60 * 1000);
    return date >= windowStart;
  }
}