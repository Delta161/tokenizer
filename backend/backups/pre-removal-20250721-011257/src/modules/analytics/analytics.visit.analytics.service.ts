import { PrismaClient } from '@prisma/client';
import {
  PropertyVisitSummary,
  ClientVisitBreakdown,
  TrendingProperty,
  DailyVisitCount,
  PropertyVisitStats,
  VisitTimeRange
} from './analytics.visit.analytics.types.js';

/**
 * Service class for handling visit analytics operations
 */
export class AnalyticsVisitAnalyticsService {
  private prisma: PrismaClient;

  /**
   * Creates a new instance of VisitAnalyticsService
   * @param prisma - The Prisma client instance
   */
  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Get visit summary for a specific property
   * @param propertyId - The property ID
   * @param range - The time range (days)
   * @returns The property visit summary or null if property not found
   */
  async getPropertyVisitSummary(propertyId: string, range: string = VisitTimeRange.MONTH): Promise<PropertyVisitSummary | null> {
    const days = parseInt(range, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    try {
      // Check if property exists
      const property = await this.prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true }
      });

      if (!property) {
        return null;
      }

      // Get total visits
      const totalVisits = await this.prisma.visit.count({
        where: {
          propertyId,
          createdAt: { gte: startDate }
        }
      });

      // Get unique visitors (by userId if available, otherwise by ipAddress)
      const uniqueVisitorsByUser = await this.prisma.visit.groupBy({
        by: ['userId'],
        where: {
          propertyId,
          createdAt: { gte: startDate },
          userId: { not: null }
        }
      });

      const uniqueVisitorsByIp = await this.prisma.visit.groupBy({
        by: ['ipAddress'],
        where: {
          propertyId,
          createdAt: { gte: startDate },
          userId: null
        }
      });

      const uniqueVisitors = uniqueVisitorsByUser.length + uniqueVisitorsByIp.length;

      // Get daily visit counts
      const dailyVisits = await this.getDailyVisitCounts(propertyId, days);

      return {
        propertyId,
        totalVisits,
        uniqueVisitors,
        trend: dailyVisits
      };
    } catch (error) {
      console.error('Error getting property visit summary:', error);
      throw error;
    }
  }

  /**
   * Get visit breakdown for a client's properties
   * @param clientId - The client ID
   * @returns The client visit breakdown or null if client not found
   */
  async getClientVisitBreakdown(clientId: string): Promise<ClientVisitBreakdown | null> {
    try {
      // Check if client exists
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
        select: { id: true }
      });

      if (!client) {
        return null;
      }

      // Get client's properties
      const properties = await this.prisma.property.findMany({
        where: { clientId },
        select: { id: true, title: true }
      });

      if (properties.length === 0) {
        return {
          clientId,
          totalVisits: 0,
          propertiesCount: 0,
          properties: []
        };
      }

      const propertyIds = properties.map(p => p.id);

      // Get visit counts for each property
      const visitCounts = await this.prisma.visit.groupBy({
        by: ['propertyId'],
        where: { propertyId: { in: propertyIds } },
        _count: { id: true }
      });

      // Map visit counts to properties
      const propertyStats: PropertyVisitStats[] = properties.map(property => {
        const visitCount = visitCounts.find(vc => vc.propertyId === property.id);
        return {
          propertyId: property.id,
          title: property.title,
          visitCount: visitCount ? visitCount._count.id : 0
        };
      });

      // Sort properties by visit count (descending)
      propertyStats.sort((a, b) => b.visitCount - a.visitCount);

      // Calculate total visits
      const totalVisits = propertyStats.reduce((sum, property) => sum + property.visitCount, 0);

      return {
        clientId,
        totalVisits,
        propertiesCount: properties.length,
        properties: propertyStats
      };
    } catch (error) {
      console.error('Error getting client visit breakdown:', error);
      throw error;
    }
  }

  /**
   * Get trending properties (most visited in the last 7 days)
   * @param limit - The maximum number of properties to return
   * @returns Array of trending properties
   */
  async getTrendingProperties(limit: number = 5): Promise<TrendingProperty[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days

      // Get visit counts for all properties in the last 7 days
      const visitCounts = await this.prisma.visit.groupBy({
        by: ['propertyId'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: limit
      });

      if (visitCounts.length === 0) {
        return [];
      }

      const propertyIds = visitCounts.map(vc => vc.propertyId);

      // Get property details
      const properties = await this.prisma.property.findMany({
        where: { id: { in: propertyIds } },
        select: { id: true, title: true }
      });

      // Map property details to visit counts
      return visitCounts.map(vc => {
        const property = properties.find(p => p.id === vc.propertyId);
        return {
          propertyId: vc.propertyId,
          title: property?.title || 'Unknown Property',
          visitCount: vc._count.id
        };
      });
    } catch (error) {
      console.error('Error getting trending properties:', error);
      throw error;
    }
  }

  /**
   * Helper method to get daily visit counts for a property
   * @param propertyId - The property ID
   * @param days - The number of days to include
   * @returns Array of daily visit counts
   */
  private async getDailyVisitCounts(propertyId: string, days: number): Promise<DailyVisitCount[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all visits for the property in the date range
    const visits = await this.prisma.visit.findMany({
      where: {
        propertyId,
        createdAt: { gte: startDate }
      },
      select: { createdAt: true }
    });

    // Generate all dates in the range
    const dateMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateString = this.formatDate(date);
      dateMap.set(dateString, 0);
    }

    // Count visits per day
    visits.forEach(visit => {
      const dateString = this.formatDate(visit.createdAt);
      if (dateMap.has(dateString)) {
        dateMap.set(dateString, dateMap.get(dateString)! + 1);
      }
    });

    // Convert map to array and sort by date
    return Array.from(dateMap.entries())
      .map(([date, visits]) => ({ date, visits }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Format date as YYYY-MM-DD
   * @param date - The date to format
   * @returns Formatted date string
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}