import { validatePropertyId, validateClientId, validateTimeRange } from '../validators/visit.analytics.validators.js';
import { UserRole } from '@prisma/client';
import { hasRole } from '../../auth/requireRole.js';
export class VisitAnalyticsController {
    visitAnalyticsService;
    constructor(visitAnalyticsService) {
        this.visitAnalyticsService = visitAnalyticsService;
    }
    /**
     * Get visit summary for a specific property
     */
    getPropertyVisits = async (req, res) => {
        try {
            // Validate property ID
            const propertyIdResult = validatePropertyId(req.params.id);
            if (!propertyIdResult.success) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid property ID'
                });
                return;
            }
            // Validate time range
            const timeRangeResult = validateTimeRange(req.query.range);
            if (!timeRangeResult.success) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid time range'
                });
                return;
            }
            // Check if user has required role (INVESTOR or higher)
            if (!req.user || !hasRole(req.user.role, UserRole.INVESTOR)) {
                res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
                return;
            }
            const propertyId = propertyIdResult.data.id;
            const range = timeRangeResult.data.range;
            // Get property visit summary
            const visitSummary = await this.visitAnalyticsService.getPropertyVisitSummary(propertyId, range);
            if (!visitSummary) {
                res.status(404).json({
                    success: false,
                    error: 'Property not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: visitSummary
            });
        }
        catch (error) {
            console.error('Error getting property visits:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve property visit data'
            });
        }
    };
    /**
     * Get visit breakdown for a client's properties
     */
    getClientVisits = async (req, res) => {
        try {
            // Validate client ID
            const clientIdResult = validateClientId(req.params.id);
            if (!clientIdResult.success) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid client ID'
                });
                return;
            }
            const clientId = clientIdResult.data.id;
            // Check if user is admin or owns the client ID
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            // Check if user is admin or the client owner
            const isAdmin = req.user.role === UserRole.ADMIN;
            const isClientOwner = await this.isClientOwner(req.user.id, clientId);
            if (!isAdmin && !isClientOwner) {
                res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
                return;
            }
            // Get client visit breakdown
            const visitBreakdown = await this.visitAnalyticsService.getClientVisitBreakdown(clientId);
            if (!visitBreakdown) {
                res.status(404).json({
                    success: false,
                    error: 'Client not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: visitBreakdown
            });
        }
        catch (error) {
            console.error('Error getting client visits:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve client visit data'
            });
        }
    };
    /**
     * Get trending properties (most visited in the last 7 days)
     */
    getTrendingProperties = async (req, res) => {
        try {
            // Check if user has required role (INVESTOR or higher)
            if (!req.user || !hasRole(req.user.role, UserRole.INVESTOR)) {
                res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
                return;
            }
            // Get trending properties
            const trendingProperties = await this.visitAnalyticsService.getTrendingProperties();
            res.status(200).json({
                success: true,
                data: trendingProperties
            });
        }
        catch (error) {
            console.error('Error getting trending properties:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve trending properties data'
            });
        }
    };
    /**
     * Helper method to check if a user is the owner of a client
     */
    isClientOwner = async (userId, clientId) => {
        try {
            const client = await this.visitAnalyticsService['prisma'].client.findFirst({
                where: {
                    id: clientId,
                    userId
                }
            });
            return !!client;
        }
        catch (error) {
            console.error('Error checking client ownership:', error);
            return false;
        }
    };
}
//# sourceMappingURL=visit.analytics.controller.js.map