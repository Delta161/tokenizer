import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../auth/requireAuth.js';
import { KycService } from '../services/kyc.service.js';
import { KycSubmissionSchema, KycUpdateSchema } from '../validators/kyc.validators.js';
import { KycProvider } from '../provider/index.js';

export class KycController {
  private kycService: KycService;

  constructor(private prisma: PrismaClient) {
    this.kycService = new KycService(prisma);
  }

  /**
   * Get current user's KYC record
   */
  getCurrentUserKyc = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const kycRecord = await this.kycService.getByUserId(req.user.id);

      res.json({
        success: true,
        data: kycRecord || { status: 'NOT_SUBMITTED' }
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Initiate KYC verification with a provider
   */
  initiateProviderVerification = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }
      
      const { provider } = req.params;
      const { redirectUrl } = req.body;
      
      // Validate provider
      if (!Object.values(KycProvider).includes(provider as KycProvider)) {
        res.status(400).json({
          success: false,
          error: `Unsupported provider: ${provider}`
        });
        return;
      }
      
      // Validate redirect URL
      if (!redirectUrl || typeof redirectUrl !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid redirect URL'
        });
        return;
      }
      
      const session = await this.kycService.initiateProviderVerification(
        req.user.id,
        provider as KycProvider,
        redirectUrl
      );
      
      res.status(200).json({
        success: true,
        data: {
          redirectUrl: session.redirectUrl,
          expiresAt: session.expiresAt,
          referenceId: session.referenceId
        }
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Sync KYC status from provider (admin only)
   */
  syncKycStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }
      
      const kycRecord = await this.kycService.syncKycStatus(userId);
      
      if (!kycRecord) {
        res.status(404).json({
          success: false,
          error: 'KYC record not found or no provider information available'
        });
        return;
      }
      
      res.json({
        success: true,
        data: kycRecord
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Submit KYC information
   */
  submitKyc = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Validate request body
      const validationResult = KycSubmissionSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: validationResult.error.format()
        });
        return;
      }

      const kycRecord = await this.kycService.submitKyc(
        req.user.id,
        validationResult.data
      );

      res.status(201).json({
        success: true,
        data: kycRecord
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all KYC records (admin only)
   */
  getAllKycRecords = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const kycRecords = await this.kycService.getAllKycRecords();

      res.json({
        success: true,
        data: kycRecords
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get KYC record for a specific user (admin only)
   */
  getUserKyc = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      const kycRecord = await this.kycService.getByUserId(userId);

      if (!kycRecord) {
        res.status(404).json({
          success: false,
          error: 'KYC record not found'
        });
        return;
      }

      res.json({
        success: true,
        data: kycRecord
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update KYC status (admin only)
   */
  updateKycStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      // Validate request body
      const validationResult = KycUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: validationResult.error.format()
        });
        return;
      }

      const kycRecord = await this.kycService.updateKycStatus(
        userId,
        validationResult.data
      );

      res.json({
        success: true,
        data: kycRecord
      });
    } catch (error) {
      next(error);
    }
  };
}