import { UserRole, PropertyStatus } from '@prisma/client';
export class AdminAnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Get platform-wide summary statistics
     */
    async getPlatformSummary() {
        // Get user counts
        const userCounts = await this.prisma.user.groupBy({
            by: ['role'],
            _count: {
                id: true
            }
        });
        // Get property counts
        const propertyCounts = await this.prisma.property.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });
        // Get token count
        const tokenCount = await this.prisma.token.count();
        // Get investment count
        const investmentCount = await this.prisma.investment.count();
        // Format user counts by role
        const usersByRole = {
            [UserRole.ADMIN]: 0,
            [UserRole.INVESTOR]: 0,
            [UserRole.CLIENT]: 0
        };
        userCounts.forEach(count => {
            usersByRole[count.role] = count._count.id;
        });
        // Format property counts by status
        const propertiesByStatus = {
            [PropertyStatus.DRAFT]: 0,
            [PropertyStatus.SUBMITTED]: 0,
            [PropertyStatus.APPROVED]: 0,
            [PropertyStatus.REJECTED]: 0
        };
        propertyCounts.forEach(count => {
            propertiesByStatus[count.status] = count._count.id;
        });
        return {
            users: {
                total: Object.values(usersByRole).reduce((sum, count) => sum + count, 0),
                byRole: usersByRole
            },
            properties: {
                total: Object.values(propertiesByStatus).reduce((sum, count) => sum + count, 0),
                byStatus: propertiesByStatus
            },
            tokens: {
                total: tokenCount
            },
            investments: {
                total: investmentCount
            }
        };
    }
    /**
     * Get user registration trends over time
     */
    async getUserRegistrationTrend(query) {
        const { from, to } = query;
        // Default to last 30 days if no range provided
        const endDate = to ? new Date(to) : new Date();
        const startDate = from ? new Date(from) : new Date(endDate);
        if (!from) {
            startDate.setDate(startDate.getDate() - 30);
        }
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
        // Get all users created in the date range
        const users = await this.prisma.user.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        // Group by date
        const dailyCounts = {};
        // Initialize all dates in range with 0 count
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            dailyCounts[dateString] = 0;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        // Count registrations by date
        users.forEach(user => {
            const dateString = user.createdAt.toISOString().split('T')[0];
            dailyCounts[dateString] = (dailyCounts[dateString] || 0) + 1;
        });
        // Convert to array format
        const daily = Object.entries(dailyCounts).map(([date, count]) => ({
            date,
            count
        }));
        return {
            daily,
            total: users.length
        };
    }
    /**
     * Get property submission trends over time
     */
    async getPropertySubmissionTrend(query) {
        const { from, to, status } = query;
        // Default to last 30 days if no range provided
        const endDate = to ? new Date(to) : new Date();
        const startDate = from ? new Date(from) : new Date(endDate);
        if (!from) {
            startDate.setDate(startDate.getDate() - 30);
        }
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
        // Build where clause
        const where = {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        };
        // Add status filter if provided
        if (status) {
            where.status = status;
        }
        // Get all properties created in the date range
        const properties = await this.prisma.property.findMany({
            where,
            select: {
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        // Group by date
        const dailyCounts = {};
        // Initialize all dates in range with 0 count
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            dailyCounts[dateString] = 0;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        // Count submissions by date
        properties.forEach(property => {
            const dateString = property.createdAt.toISOString().split('T')[0];
            dailyCounts[dateString] = (dailyCounts[dateString] || 0) + 1;
        });
        // Convert to array format
        const daily = Object.entries(dailyCounts).map(([date, count]) => ({
            date,
            count
        }));
        return {
            daily,
            total: properties.length
        };
    }
    /**
     * Get visit statistics summary
     */
    async getVisitSummary() {
        // Get total visits
        const totalVisits = await this.prisma.visit.count();
        // Get top 5 most visited properties
        const topProperties = await this.prisma.visit.groupBy({
            by: ['propertyId'],
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 5
        });
        // Get property details for the top properties
        const propertyIds = topProperties.map(p => p.propertyId);
        const properties = await this.prisma.property.findMany({
            where: {
                id: {
                    in: propertyIds
                }
            },
            select: {
                id: true,
                title: true
            }
        });
        // Map property details to visit counts
        const topPropertiesWithDetails = topProperties.map(p => {
            const property = properties.find(prop => prop.id === p.propertyId);
            return {
                propertyId: p.propertyId,
                title: property?.title || 'Unknown Property',
                visitCount: p._count.id
            };
        });
        // Get recent visit trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentVisits = await this.prisma.visit.findMany({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                }
            },
            select: {
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        // Group by date
        const dailyCounts = {};
        // Initialize all dates in range with 0 count
        const currentDate = new Date(sevenDaysAgo);
        const today = new Date();
        while (currentDate <= today) {
            const dateString = currentDate.toISOString().split('T')[0];
            dailyCounts[dateString] = 0;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        // Count visits by date
        recentVisits.forEach(visit => {
            const dateString = visit.createdAt.toISOString().split('T')[0];
            dailyCounts[dateString] = (dailyCounts[dateString] || 0) + 1;
        });
        // Convert to array format
        const recentTrend = Object.entries(dailyCounts).map(([date, count]) => ({
            date,
            count
        }));
        return {
            totalVisits,
            topProperties: topPropertiesWithDetails,
            recentTrend
        };
    }
    /**
     * Get KYC status distribution
     */
    async getKycStatusDistribution() {
        // Get KYC records for INVESTOR and CLIENT roles only
        const users = await this.prisma.user.findMany({
            where: {
                role: {
                    in: [UserRole.INVESTOR, UserRole.CLIENT]
                }
            },
            include: {
                kycRecord: {
                    select: {
                        status: true
                    }
                }
            }
        });
        // Count by status
        const statusCounts = {};
        let total = 0;
        users.forEach(user => {
            const status = user.kycRecord?.status || 'NO_KYC';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
            total++;
        });
        return {
            total,
            byStatus: statusCounts
        };
    }
}
//# sourceMappingURL=admin.analytics.service.js.map