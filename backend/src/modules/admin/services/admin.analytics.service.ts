import { PrismaClient, UserRole, PropertyStatus } from '@prisma/client';
import { KycStatus } from '../../accounts/types/kyc.types.js';
import { adminLogger } from '../utils/admin.logger.js';

const prisma = new PrismaClient();

export class AdminAnalyticsService {
  /**
   * Get platform-wide summary statistics
   */
  async getPlatformSummary() {
    // Get user counts by role
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    // Get property counts by status
    const propertyCounts = await prisma.property.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Get total tokens and total investments
    const [tokenCount, investmentStats] = await Promise.all([
      prisma.token.count(),
      prisma.investment.aggregate({
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    // Get KYC status distribution
    const kycCounts = await prisma.kyc.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Format the response
    return {
      users: {
        total: userCounts.reduce((sum, item) => sum + item._count.id, 0),
        byRole: Object.fromEntries(
          userCounts.map((item) => [item.role, item._count.id])
        ),
      },
      properties: {
        total: propertyCounts.reduce((sum, item) => sum + item._count.id, 0),
        byStatus: Object.fromEntries(
          propertyCounts.map((item) => [item.status, item._count.id])
        ),
      },
      tokens: {
        total: tokenCount,
      },
      investments: {
        count: investmentStats._count.id,
        totalAmount: investmentStats._sum.amount || 0,
      },
      kyc: {
        total: kycCounts.reduce((sum, item) => sum + item._count.id, 0),
        byStatus: Object.fromEntries(
          kycCounts.map((item) => [item.status, item._count.id])
        ),
      },
    };
  }

  /**
   * Get user registration trends over time
   */
  async getUserRegistrationTrends(startDate: Date, endDate: Date, interval: 'day' | 'week' | 'month' = 'day') {
    // Validate dates
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    // Determine the date grouping based on interval
    let dateGrouping;
    if (interval === 'day') {
      dateGrouping = {
        year: { extract: 'year', from: 'createdAt' },
        month: { extract: 'month', from: 'createdAt' },
        day: { extract: 'day', from: 'createdAt' },
      };
    } else if (interval === 'week') {
      dateGrouping = {
        year: { extract: 'year', from: 'createdAt' },
        week: { extract: 'week', from: 'createdAt' },
      };
    } else {
      dateGrouping = {
        year: { extract: 'year', from: 'createdAt' },
        month: { extract: 'month', from: 'createdAt' },
      };
    }

    // Query user registrations grouped by date
    const registrations = await prisma.$queryRaw`
      SELECT 
        ${dateGrouping},
        COUNT(*) as count
      FROM "User"
      WHERE "createdAt" BETWEEN ${startDate} AND ${endDate}
      GROUP BY ${Object.keys(dateGrouping).join(', ')}
      ORDER BY ${Object.keys(dateGrouping).join(', ')}
    `;

    // Format the results based on interval
    const formattedResults = registrations.map((row: any) => {
      let dateLabel;
      if (interval === 'day') {
        dateLabel = `${row.year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}`;
      } else if (interval === 'week') {
        dateLabel = `${row.year}-W${String(row.week).padStart(2, '0')}`;
      } else {
        dateLabel = `${row.year}-${String(row.month).padStart(2, '0')}`;
      }

      return {
        date: dateLabel,
        count: parseInt(row.count),
      };
    });

    return formattedResults;
  }

  /**
   * Get property submission trends over time
   */
  async getPropertySubmissionTrends(startDate: Date, endDate: Date, status?: PropertyStatus) {
    // Validate dates
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    // Build the where clause
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (status) {
      where.status = status;
    }

    // Query property submissions grouped by date
    const submissions = await prisma.property.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    });

    // Format the results
    const formattedResults = submissions.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    return formattedResults;
  }

  /**
   * Get visit summary statistics
   */
  async getVisitSummary(startDate: Date, endDate: Date) {
    // Validate dates
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    // Query visit data
    const [pageViews, uniqueVisitors, bounceRate, avgSessionDuration] = await Promise.all([
      // Total page views
      prisma.visit.count({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Unique visitors
      prisma.visit.groupBy({
        by: ['userId'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: { id: true },
      }).then((result) => result.length),

      // Bounce rate calculation (simplified)
      prisma.$queryRaw`
        SELECT 
          COUNT(DISTINCT "visitorId") * 100.0 / NULLIF((SELECT COUNT(DISTINCT "visitorId") FROM "Visit" WHERE "timestamp" BETWEEN ${startDate} AND ${endDate}), 0) as bounce_rate
        FROM "Visit"
        WHERE "timestamp" BETWEEN ${startDate} AND ${endDate}
        GROUP BY "visitorId"
        HAVING COUNT(*) = 1
      `.then((result: any[]) => result[0]?.bounce_rate || 0),

      // Average session duration (simplified)
      prisma.$queryRaw`
        SELECT 
          AVG(EXTRACT(EPOCH FROM (MAX("timestamp") - MIN("timestamp")))) as avg_duration
        FROM "Visit"
        WHERE "timestamp" BETWEEN ${startDate} AND ${endDate}
        GROUP BY "visitorId", DATE_TRUNC('day', "timestamp")
      `.then((result: any[]) => result[0]?.avg_duration || 0),
    ]);

    // Format the results
    return {
      pageViews,
      uniqueVisitors,
      bounceRate: parseFloat(bounceRate.toFixed(2)),
      avgSessionDuration: parseFloat(avgSessionDuration.toFixed(2)),
      period: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Get KYC status distribution
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   */
  async getKycStatusDistribution(startDate: Date, endDate: Date) {
    // Validate dates
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    // Query KYC status counts with date filtering
    const kycCounts = await prisma.kycRecord.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: { id: true },
    });

    // Calculate total users with KYC
    const totalKycUsers = kycCounts.reduce((sum: number, item: { status: string; _count: { id: number } }) => sum + item._count.id, 0);

    // Calculate total users without KYC in date range
    const usersWithoutKyc = await prisma.user.count({
      where: {
        kycRecord: null,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Format the results
    const distribution: {
      total: number;
      withKyc: number;
      withoutKyc: number;
      byStatus: { [key: string]: number };
      period: { startDate: Date; endDate: Date };
      percentages?: {
        withKyc: number;
        withoutKyc: number;
        byStatus: { [key: string]: number };
      };
    } = {
      total: totalKycUsers + usersWithoutKyc,
      withKyc: totalKycUsers,
      withoutKyc: usersWithoutKyc,
      byStatus: Object.fromEntries(
        kycCounts.map((item: { status: string; _count: { id: number } }) => [item.status, item._count.id])
      ),
      period: {
        startDate,
        endDate,
      },
    };

    // Calculate percentages
    const totalUsers = distribution.total;
    if (totalUsers > 0) {
      distribution.percentages = {
        withKyc: parseFloat(((totalKycUsers / totalUsers) * 100).toFixed(2)),
        withoutKyc: parseFloat(((usersWithoutKyc / totalUsers) * 100).toFixed(2)),
        byStatus: Object.fromEntries(
          kycCounts.map((item: { status: string; _count: { id: number } }) => [
            item.status,
            parseFloat(((item._count.id / totalUsers) * 100).toFixed(2)),
          ])
        ),
      };
    }

    return distribution;
  }
}

// Create and export a singleton instance
export const adminAnalyticsService = new AdminAnalyticsService();