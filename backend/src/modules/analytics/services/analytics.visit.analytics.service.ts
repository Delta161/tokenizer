import { prisma } from '../utils/prisma.js';
import { 
  PropertyVisitSummary, 
  ClientVisitBreakdown, 
  PropertyVisitStats,
  TrendingProperty,
  DailyVisitCount,
  VisitTimeRange
} from '../types/analytics.visit.analytics.types.js';

/**
 * Service for analyzing property visits
 */
export class AnalyticsVisitAnalyticsService {
  /**
   * Creates a new instance of AnalyticsVisitAnalyticsService
   */
  constructor() {}

  /**
   * Gets a summary of visits for a specific property
   * @param propertyId - The property ID
   * @param days - Number of days to include in the summary
   * @returns The property visit summary
   */
  async getPropertyVisitSummary(
    propertyId: string,
    days: number = 30
  ): Promise<PropertyVisitSummary | null> {
    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });

    if (!property) {
      return null;
    }

    // Get total visits
    const totalVisits = await prisma.visit.count({
      where: { propertyId },
    });

    // Get unique visitors (by user ID or IP address)
    const uniqueVisitors = await prisma.$queryRaw<{ count: BigInt }[]>`
      SELECT COUNT(DISTINCT COALESCE("userId", "ipAddress")) as count
      FROM "Visit"
      WHERE "propertyId" = ${propertyId}
    `;

    // Get daily visit counts for the trend
    const dailyCounts = await this.getDailyVisitCounts(propertyId, days);

    return {
      propertyId,
      totalVisits,
      uniqueVisitors: Number(uniqueVisitors[0]?.count || 0),
      trend: dailyCounts,
    };
  }

  /**
   * Gets a breakdown of visits for a client's properties
   * @param clientId - The client ID
   * @returns The client visit breakdown
   */
  async getClientVisitBreakdown(clientId: string): Promise<ClientVisitBreakdown | null> {
    // Get all properties for the client
    const properties = await prisma.property.findMany({
      where: { clientId },
      select: { id: true, title: true },
    });

    if (properties.length === 0) {
      return null;
    }

    // Get visit counts for each property
    const propertyStats: PropertyVisitStats[] = [];
    let totalVisits = 0;

    for (const property of properties) {
      const visitCount = await prisma.visit.count({
        where: { propertyId: property.id },
      });

      propertyStats.push({
        propertyId: property.id,
        title: property.title,
        visitCount,
      });

      totalVisits += visitCount;
    }

    // Sort properties by visit count (descending)
    propertyStats.sort((a, b) => b.visitCount - a.visitCount);

    return {
      clientId,
      totalVisits,
      propertiesCount: properties.length,
      properties: propertyStats,
    };
  }

  /**
   * Gets trending properties (most visited in the last 7 days)
   * @param limit - Maximum number of properties to return
   * @returns Array of trending properties
   */
  async getTrendingProperties(limit: number = 10): Promise<TrendingProperty[]> {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get visit counts for all properties in the last 7 days
    const visitCounts = await prisma.visit.groupBy({
      by: ['propertyId'],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        propertyId: true,
      },
      orderBy: {
        _count: {
          propertyId: 'desc',
        },
      },
      take: limit,
    });

    // Get property details for the trending properties
    const trendingProperties: TrendingProperty[] = [];

    for (const count of visitCounts) {
      const property = await prisma.property.findUnique({
        where: { id: count.propertyId },
        select: { id: true, title: true },
      });

      if (property) {
        trendingProperties.push({
          propertyId: property.id,
          title: property.title,
          visitCount: count._count.propertyId,
        });
      }
    }

    return trendingProperties;
  }

  /**
   * Gets daily visit counts for a property
   * @param propertyId - The property ID
   * @param days - Number of days to include
   * @returns Array of daily visit counts
   */
  private async getDailyVisitCounts(
    propertyId: string,
    days: number
  ): Promise<DailyVisitCount[]> {
    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    // Get visits grouped by day
    const visitsByDay = await prisma.visit.groupBy({
      by: ['createdAt'],
      where: {
        propertyId,
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Create a map of date to visit count
    const countsByDate = new Map<string, number>();
    for (const visit of visitsByDay) {
      const dateStr = this.formatDate(visit.createdAt);
      const count = visit._count.id;
      countsByDate.set(dateStr, (countsByDate.get(dateStr) || 0) + count);
    }

    // Create an array of all dates in the range
    const result: DailyVisitCount[] = [];
    const currentDate = new Date(startDate);
    const endDate = new Date();

    while (currentDate <= endDate) {
      const dateStr = this.formatDate(currentDate);
      result.push({
        date: dateStr,
        visits: countsByDate.get(dateStr) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  /**
   * Formats a date as YYYY-MM-DD
   * @param date - The date to format
   * @returns The formatted date string
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}