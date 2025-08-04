import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../accounts/middleware/auth.middleware.js';
import { AnalyticsVisitService } from '../services/analytics.visit.service.js';
import { validateCreateVisit } from '../validators/analytics.visit.validators.js';
import { VisitResponse } from '../types/analytics.visit.types.js';

/**
 * Controller class for handling visit-related HTTP requests
 */
export class AnalyticsVisitController {
  private visitService: AnalyticsVisitService;

  /**
   * Creates a new instance of VisitController
   * @param visitService - The VisitService instance
   */
  constructor(visitService?: AnalyticsVisitService) {
    this.visitService = visitService || new AnalyticsVisitService();
  }

  /**
   * Handles the POST /visits request to create a new visit
   * @param req - The HTTP request object
   * @param res - The HTTP response object
   */
  createVisit = async (req: AuthenticatedRequest, res: Response, next: Function): Promise<void> => {
    try {
      // Validate the request body
      const validationResult = validateCreateVisit(req.body);

      if (!validationResult.success) {
        const errorMessage = validationResult.error.format();
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: JSON.stringify(errorMessage),
        } as VisitResponse);
        return;
      }

      // Extract data from the validated request
      const { propertyId } = validationResult.data;

      // Extract user ID from authenticated request (if available)
      const userId = req.user?.id;

      // Extract additional data from request headers
      const ipAddress = this.extractIpAddress(req);
      const userAgent = this.extractUserAgent(req);
      const referrer = this.extractReferrer(req);

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
    } catch (error: unknown) {
      console.error('Error creating visit:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * Extract IP address from request
   * @param req - The HTTP request
   * @returns The IP address or undefined
   */
  private extractIpAddress(req: Request): string | undefined {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      undefined
    );
  }

  /**
   * Extract user agent from request
   * @param req - The HTTP request
   * @returns The user agent or undefined
   */
  private extractUserAgent(req: Request): string | undefined {
    return req.headers['user-agent'] as string | undefined;
  }

  /**
   * Extract referrer from request
   * @param req - The HTTP request
   * @returns The referrer or undefined
   */
  private extractReferrer(req: Request): string | undefined {
    return req.headers.referer as string | undefined;
  }
}