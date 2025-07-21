import { PrismaClient, UserRole, PropertyStatus, KycStatus } from '@prisma/client';
import { Logger } from '../../utils/logger.js';

const prisma = new PrismaClient();
const logger = new Logger('AdminAnalyticsService');

export class AdminAnalyticsService {
  /**
   * Get platform-wide summary statistics
   */
  async getSummary() {
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
        _count: {
          id: true,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Format user counts
    const users = {
      total: userCounts.reduce((sum, item) => sum + item._count.id, 0),
      investors: userCounts.find(item => item.role === UserRole.INVESTOR)?._count.id || 0,
      clients: userCounts.find(item => item.role === UserRole.CLIENT)?._count.id || 0,
      admins: userCounts.find(item => item.role === UserRole.ADMIN)?._count.id || 0,
    };

    // Format property counts
    const properties = {
      total: propertyCounts.reduce((sum, item) => sum + item._count.id, 0),
      submitted: propertyCounts.find(item => item.status === PropertyStatus.SUBMITTED)?._count.id || 0,
      approved: propertyCounts.find(item => item.status === PropertyStatus.APPROVED)?._count.id || 0,
      rejected: propertyCounts.find(item => item.status === PropertyStatus.REJECTED)?._count.id || 0,
      tokenized: propertyCounts.find(item => item.status === PropertyStatus.TOKENIZED)?._count.id || 0,
    };

    // Format token and investment stats
    const tokens = {
      total: tokenCount,
    };

    const investments = {
      total: investmentStats._count.id,
      totalAmount: investmentStats._sum.amount || 0,
    };

    return {
      users,
      properties,
      tokens,
      investments,
    };
  }

  /**
   * Get user registration trends over time
   */
  async getUserRegistrations(dateFrom: Date, dateTo: Date) {
    // Ensure we have valid date range
    if (dateFrom > dateTo) {
      throw new Error('Invalid date range');
    }

    // Get all users created within the date range
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      select: {
        id: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group users by date and role
    const registrationsByDate = new Map();
    
    users.forEach(user => {
      const dateKey = user.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!registrationsByDate.has(dateKey)) {
        registrationsByDate.set(dateKey, {
          date: dateKey,
          total: 0,
          investors: 0,
          clients: 0,
        });
      }
      
      const dateStats = registrationsByDate.get(dateKey);
      dateStats.total += 1;
      
      if (user.role === UserRole.INVESTOR) {
        dateStats.investors += 1;
      } else if (user.role === UserRole.CLIENT) {
        dateStats.clients += 1;
      }
    });

    // Convert map to array and sort by date
    return Array.from(registrationsByDate.values()).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }

  /**
   * Get property submission trends over time
   */
  async getPropertySubmissions(dateFrom: Date, dateTo: Date) {
    // Ensure we have valid date range
    if (dateFrom > dateTo) {
      throw new Error('Invalid date range');
    }

    // Get all properties created within the date range
    const properties = await prisma.property.findMany({
      where: {
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group properties by date and status
    const submissionsByDate = new Map();
    
    properties.forEach(property => {
      const dateKey = property.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!submissionsByDate.has(dateKey)) {
        submissionsByDate.set(dateKey, {
          date: dateKey,
          total: 0,
          approved: 0,
          rejected: 0,
          tokenized: 0,
        });
      }
      
      const dateStats = submissionsByDate.get(dateKey);
      dateStats.total += 1;
      
      if (property.status === PropertyStatus.APPROVED) {
        dateStats.approved += 1;
      } else if (property.status === PropertyStatus.REJECTED) {
        dateStats.rejected += 1;
      } else if (property.status === PropertyStatus.TOKENIZED) {
        dateStats.tokenized += 1;
      }
    });

    // Convert map to array and sort by date
    return Array.from(submissionsByDate.values()).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }

  /**
   * Get visit statistics
   */
  async getVisitSummary(dateFrom: Date, dateTo: Date) {
    // Ensure we have valid date range
    if (dateFrom > dateTo) {
      throw new Error('Invalid date range');
    }

    // Get all visits within the date range
    const visits = await prisma.visit.findMany({
      where: {
        timestamp: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      select: {
        id: true,
        page: true,
        timestamp: true,
        userId: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Count unique visitors
    const uniqueVisitors = new Set();
    visits.forEach(visit => {
      if (visit.userId) {
        uniqueVisitors.add(visit.userId);
      }
    });

    // Group visits by page
    const visitsByPage = new Map();
    visits.forEach(visit => {
      const page = visit.page || 'unknown';
      
      if (!visitsByPage.has(page)) {
        visitsByPage.set(page, 0);
      }
      
      visitsByPage.set(page, visitsByPage.get(page) + 1);
    });

    // Group visits by date
    const visitsByDate = new Map();
    visits.forEach(visit => {
      const dateKey = visit.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!visitsByDate.has(dateKey)) {
        visitsByDate.set(dateKey, 0);
      }
      
      visitsByDate.set(dateKey, visitsByDate.get(dateKey) + 1);
    });

    // Format the results
    return {
      totalVisits: visits.length,
      uniqueVisitors: uniqueVisitors.size,
      topPages: Array.from(visitsByPage.entries())
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      visitsByDate: Array.from(visitsByDate.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };
  }

  /**
   * Get KYC status distribution
   */
  async getKycStatusDistribution() {
    // Get KYC records grouped by status
    const kycStatusCounts = await prisma.kycRecord.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Format the results
    const distribution = {
      total: kycStatusCounts.reduce((sum, item) => sum + item._count.id, 0),
      pending: kycStatusCounts.find(item => item.status === KycStatus.PENDING)?._count.id || 0,
      approved: kycStatusCounts.find(item => item.status === KycStatus.APPROVED)?._count.id || 0,
      rejected: kycStatusCounts.find(item => item.status === KycStatus.REJECTED)?._count.id || 0,
    };

    return distribution;
  }
}