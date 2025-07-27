import { Request, Response } from 'express';
import { AnalyticsVisitAnalyticsService } from '../services/analytics.visit.analytics.service.js';
import { validatePropertyId, validateClientId, validateTimeRange } from '../validators/analytics.visit.analytics.validators.js';
import { UserRole } from '@prisma/client';
import { hasRole, AuthenticatedRequest } from '../../../middleware/auth.middleware.js';

/**
 * Controller class for handling visit analytics-related HTTP requests
 */
export class AnalyticsVisitAnalyticsController {
  private visitAnalyticsService: AnalyticsVisitAnalyticsService;

  /**
   * Creates a new instance of VisitAnalyticsController
   * @param visitAnalyticsService - The VisitAnalyticsService instance
   */
  constructor(visitAnalyticsService?: AnalyticsVisitAnalyticsService) {
    this.visitAnalyticsService = visitAnalyticsService || new AnalyticsVisitAnalyticsService();
  }

  /**
   * Get visit summary for a specific property
   * @param req - The HTTP request
   * @param res - The HTTP response
   */
  getPropertyVisits = async (req: AuthenticatedRequest, res: Response, next: Function): Promise<void> => {
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
      const timeRangeResult = validateTimeRange(req.query.range as string | undefined);
      if (!timeRangeResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid time range'
        });
        return;
      }

      // Check if user has required role (INVESTOR or higher)
      if (!req.user || req.user.role !== UserRole.INVESTOR && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
        return;
      }

      const propertyId = propertyIdResult.data.id;
      const range = timeRangeResult.data.range;

      // Get property visit summary
      const visitSummary = await this.visitAnalyticsService.getPropertyVisitSummary(propertyId, parseInt(range));

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
    } catch (error) {
      console.error('Error getting property visits:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * Get visit breakdown for a client's properties
   * @param req - The HTTP request
   * @param res - The HTTP response
   */
  getClientVisits = async (req: AuthenticatedRequest, res: Response, next: Function): Promise<void> => {
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

      // Check if user is authenticated
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
    } catch (error) {
      console.error('Error getting client visits:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * Get trending properties (most visited in the last 7 days)
   * @param req - The HTTP request
   * @param res - The HTTP response
   */
  getTrendingProperties = async (req: AuthenticatedRequest, res: Response, next: Function): Promise<void> => {
    try {
      // Check if user has required role (INVESTOR or higher)
      if (!req.user || (req.user.role !== UserRole.INVESTOR && req.user.role !== UserRole.ADMIN)) {
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
    } catch (error) {
      console.error('Error getting trending properties:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * Helper method to check if a user is the owner of a client
   * @param userId - The user ID
   * @param clientId - The client ID
   * @returns True if the user is the owner of the client, false otherwise
   */
  private isClientOwner = async (userId: string, clientId: string): Promise<boolean> => {
    try {
      // Import prisma directly from utils
      const { prisma } = await import('../utils/prisma.js');
      
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          userId
        }
      });

      return !!client;
    } catch (error) {
      console.error('Error checking client ownership:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  };
}