import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../accounts/types/auth.types.js';
import { VisitService } from '../services/visit.service.js';
import { validateCreateVisit } from '../validators/visit.validators.js';
import { VisitResponse } from '../types/visit.types.js';
import { extractIpAddress, extractUserAgent, extractReferrer } from '../utils/visit.helpers.js';

/**
 * Controller class for handling visit-related HTTP requests
 */
export class VisitController {
  private visitService: VisitService;

  /**
   * Creates a new instance of VisitController
   * @param visitService - The VisitService instance
   */
  constructor(visitService: VisitService) {
    this.visitService = visitService;
  }

  /**
   * Handles the POST /visits request to create a new visit
   * @param req - The HTTP request object
   * @param res - The HTTP response object
   */
  async createVisit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Validate the request body
      const validationResult = validateCreateVisit(req.body);

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: errorMessage,
        } as VisitResponse);
        return;
      }

      // Extract data from the validated request
      const { propertyId } = validationResult.data;

      // Extract user ID from authenticated request (if available)
      const userId = req.user?.id;

      // Extract additional data from request headers
      const ipAddress = extractIpAddress(req);
      const userAgent = extractUserAgent(req);
      const referrer = extractReferrer(req);

      // Create the visit
      const visit = await this.visitService.createVisit({
        propertyId,
        userId,
        ipAddress,
        userAgent,
        referrer,
      });

      // If null is returned, it means the request was rate limited
      if (!visit) {
        res.status(429).json({
          success: false,
          message: 'Rate limited. Visit already recorded recently.',
        } as VisitResponse);
        return;
      }

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Visit recorded successfully',
        data: { visit },
      } as VisitResponse);
    } catch (error) {
      console.error('Error creating visit:', error);

      // Handle specific errors
      if (error instanceof Error && error.message === 'Property not found') {
        res.status(404).json({
          success: false,
          message: 'Property not found',
          error: 'The specified property does not exist',
        } as VisitResponse);
        return;
      }

      // Generic error response
      res.status(500).json({
        success: false,
        message: 'Failed to record visit',
        error: 'An unexpected error occurred',
      } as VisitResponse);
    }
  };
}