import { Visit } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { CreateVisitDto } from '../types/analytics.visit.types.js';

/**
 * Service for managing property visits
 */
export class AnalyticsVisitService {
  // Rate limiting window in minutes
  private readonly RATE_LIMIT_MINUTES = 30;

  /**
   * Creates a new instance of AnalyticsVisitService
   */
  constructor() {}

  /**
   * Creates a new visit record if it doesn't violate rate limiting
   * @param visitData - The visit data
   * @returns The created visit or null if rate limited
   */
  async createVisit(visitData: CreateVisitDto): Promise<Visit | null> {
    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: visitData.propertyId },
      select: { id: true },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Check for recent visits from the same user/IP to the same property
    const recentVisit = await this.findRecentVisit(
      visitData.propertyId,
      visitData.userId,
      visitData.ipAddress
    );

    // If a recent visit exists, don't create a new one (rate limiting)
    if (recentVisit) {
      return null;
    }

    // Create the visit record
    return prisma.visit.create({
      data: {
        propertyId: visitData.propertyId,
        userId: visitData.userId,
        ipAddress: visitData.ipAddress,
        userAgent: visitData.userAgent,
        referrer: visitData.referrer,
      },
    });
  }

  /**
   * Finds a recent visit from the same user/IP to the same property
   * @param propertyId - The property ID
   * @param userId - The user ID (optional)
   * @param ipAddress - The IP address (optional)
   * @returns The recent visit or null if none found
   */
  private async findRecentVisit(
    propertyId: string,
    userId?: string,
    ipAddress?: string
  ): Promise<Visit | null> {
    // Need either userId or ipAddress for rate limiting
    if (!userId && !ipAddress) {
      return null;
    }

    // Build the where clause
    const where: any = {
      propertyId,
      createdAt: {
        gte: new Date(Date.now() - this.RATE_LIMIT_MINUTES * 60 * 1000),
      },
    };

    // Add user ID or IP address condition
    if (userId) {
      where.userId = userId;
    } else if (ipAddress) {
      where.ipAddress = ipAddress;
    }

    // Find the most recent visit that matches the criteria
    return prisma.visit.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Checks if a date is within a specified time window from now
   * @param date - The date to check
   * @param minutes - The time window in minutes
   * @returns True if the date is within the time window
   */
  private isWithinTimeWindow(date: Date, minutes: number): boolean {
    const now = new Date();
    const windowStart = new Date(now.getTime() - minutes * 60 * 1000);
    return date >= windowStart;
  }
}