import { VisitTimeRange } from '../types/visit.analytics.types.js';
export class VisitAnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Get visit summary for a specific property
     */
    async getPropertyVisitSummary(propertyId, range = VisitTimeRange.MONTH) {
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
        }
        catch (error) {
            console.error('Error getting property visit summary:', error);
            throw error;
        }
    }
    /**
     * Get visit breakdown for a client's properties
     */
    async getClientVisitBreakdown(clientId) {
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
            const propertyStats = properties.map(property => {
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
        }
        catch (error) {
            console.error('Error getting client visit breakdown:', error);
            throw error;
        }
    }
    /**
     * Get trending properties (most visited in the last 7 days)
     */
    async getTrendingProperties(limit = 5) {
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
        }
        catch (error) {
            console.error('Error getting trending properties:', error);
            throw error;
        }
    }
    /**
     * Helper method to get daily visit counts for a property
     */
    async getDailyVisitCounts(propertyId, days) {
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
        const dateMap = new Map();
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
                dateMap.set(dateString, dateMap.get(dateString) + 1);
            }
        });
        // Convert map to array and sort by date
        return Array.from(dateMap.entries())
            .map(([date, visits]) => ({ date, visits }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    /**
     * Format date as YYYY-MM-DD
     */
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
}
//# sourceMappingURL=visit.analytics.service.js.map