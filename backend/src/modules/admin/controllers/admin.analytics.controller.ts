import { Request, Response } from 'express';
import { AdminAnalyticsService } from '../services/admin.analytics.service.js';
import { adminLogger } from '../utils/admin.logger.js';
import { analyticsDateRangeSchema, userRegistrationQuerySchema, propertySubmissionQuerySchema } from '../validators/admin.analytics.validator.js';

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
      const { startDate, endDate, interval } = req.query;
      
      const validatedData = userRegistrationQuerySchema.parse({
        startDate: startDate as string,
        endDate: endDate as string,
        interval: interval as string
      });
      
      const registrationData = await this.adminAnalyticsService.getUserRegistrationTrends(
        validatedData.startDate,
        validatedData.endDate,
        validatedData.interval
      );
      
      adminLogger.info('Admin retrieved user registration trends');
      return res.status(200).json(registrationData);
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
      const { startDate, endDate, status } = req.query;
      
      const validatedData = propertySubmissionQuerySchema.parse({
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string
      });
      
      const submissionData = await this.adminAnalyticsService.getPropertySubmissionTrends(
        validatedData.startDate,
        validatedData.endDate,
        validatedData.status
      );
      
      adminLogger.info('Admin retrieved property submission trends');
      return res.status(200).json(submissionData);
    } catch (error: any) {
      adminLogger.error('Error getting property submission trends', { error: error.message });
      return res.status(500).json({ error: 'Failed to get property submission trends' });
    }
  };

  /**
   * Get visit summary
   */
  getVisitSummary = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      const validatedData = analyticsDateRangeSchema.parse({
        startDate: startDate as string,
        endDate: endDate as string
      });
      
      const visitData = await this.adminAnalyticsService.getVisitSummary(
        validatedData.startDate,
        validatedData.endDate
      );
      
      adminLogger.info('Admin retrieved visit summary');
      return res.status(200).json(visitData);
    } catch (error: any) {
      adminLogger.error('Error getting visit summary', { error: error.message });
      return res.status(500).json({ error: 'Failed to get visit summary' });
    }
  };

  /**
   * Get KYC status distribution
   */
  getKycStatusDistribution = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      const validatedData = analyticsDateRangeSchema.parse({
        startDate: startDate as string,
        endDate: endDate as string
      });
      
      const kycData = await this.adminAnalyticsService.getKycStatusDistribution(
        validatedData.startDate,
        validatedData.endDate
      );
      
      adminLogger.info('Admin retrieved KYC status distribution');
      return res.status(200).json(kycData);
    } catch (error: any) {
      adminLogger.error('Error getting KYC status distribution', { error: error.message });
      return res.status(500).json({ error: 'Failed to get KYC status distribution' });
    }
  };
}

// Create and export a singleton instance
// Temporary singleton - will be replaced with proper dependency injection
export const adminAnalyticsController: AdminAnalyticsController = null as any;