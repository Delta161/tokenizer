import { Request, Response } from 'express';
import { AdminAnalyticsService } from '../services/admin.analytics.service.js';
import { adminLogger } from '../utils/admin.logger.js';
import { dateRangeQuerySchema, propertySubmissionQuerySchema } from '../validators/admin.validators.js';

export class AdminAnalyticsController {
  private adminAnalyticsService: AdminAnalyticsService;

  constructor(adminAnalyticsService: AdminAnalyticsService) {
    this.adminAnalyticsService = adminAnalyticsService;
  }

  /**
   * Get platform overview summary
   */
  getSummary = async (req: Request, res: Response) => {
    try {
      const summary = await this.adminAnalyticsService.getPlatformSummary();
      adminLogger.info('Admin retrieved platform summary');
      return res.status(200).json(summary);
    } catch (error: any) {
      adminLogger.error('Error getting platform summary', { error: error.message });
      return res.status(500).json({ error: 'Failed to get platform summary' });
    }
  };

  /**
   * Get user registration trends
   */
  getUserRegistrations = async (req: Request, res: Response) => {
    try {
      const parseResult = dateRangeQuerySchema.safeParse(req.query);
      
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: parseResult.error.format(),
        });
      }

      const { from, to } = parseResult.data;
      
      const registrationTrend = await this.adminAnalyticsService.getUserRegistrationTrend({
        from,
        to
      });

      adminLogger.info('Admin retrieved user registration trends', { from, to });
      return res.status(200).json(registrationTrend);
    } catch (error: any) {
      adminLogger.error('Error getting user registration trends', { error: error.message });
      return res.status(500).json({ error: 'Failed to get user registration trends' });
    }
  };

  /**
   * Get property submission trends
   */
  getPropertySubmissions = async (req: Request, res: Response) => {
    try {
      const parseResult = propertySubmissionQuerySchema.safeParse(req.query);
      
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: parseResult.error.format(),
        });
      }

      const { from, to, status } = parseResult.data;
      
      const submissionTrend = await this.adminAnalyticsService.getPropertySubmissionTrend({
        from,
        to,
        status
      });

      adminLogger.info('Admin retrieved property submission trends', { from, to, status });
      return res.status(200).json(submissionTrend);
    } catch (error: any) {
      adminLogger.error('Error getting property submission trends', { error: error.message });
      return res.status(500).json({ error: 'Failed to get property submission trends' });
    }
  };

  /**
   * Get visit statistics summary
   */
  getVisitSummary = async (req: Request, res: Response) => {
    try {
      const visitSummary = await this.adminAnalyticsService.getVisitSummary();
      adminLogger.info('Admin retrieved visit statistics summary');
      return res.status(200).json(visitSummary);
    } catch (error: any) {
      adminLogger.error('Error getting visit statistics summary', { error: error.message });
      return res.status(500).json({ error: 'Failed to get visit statistics summary' });
    }
  };

  /**
   * Get KYC status distribution
   */
  getKycStatusDistribution = async (req: Request, res: Response) => {
    try {
      const kycDistribution = await this.adminAnalyticsService.getKycStatusDistribution();
      adminLogger.info('Admin retrieved KYC status distribution');
      return res.status(200).json(kycDistribution);
    } catch (error: any) {
      adminLogger.error('Error getting KYC status distribution', { error: error.message });
      return res.status(500).json({ error: 'Failed to get KYC status distribution' });
    }
  };
}