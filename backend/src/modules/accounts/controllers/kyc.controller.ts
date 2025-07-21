// External packages
import { NextFunction, Request, Response } from 'express';

// Internal modules
import type { AuthenticatedRequest } from '@modules/accounts/middleware/auth.middleware';
import { KycService } from '@modules/accounts/services/kyc.service';
import type { KycProvider } from '@modules/accounts/types/kyc.types';
import { KycSubmissionSchema, KycUpdateSchema } from '@modules/accounts/validators/kyc.validator';

export class KycController {
  private kycService: KycService;

  constructor(kycService: KycService) {
    this.kycService = kycService;
  }
  
  // Static factory method to create instance with singleton service
  static getInstance(): KycController {
    return new KycController(kycService);
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
        const error = new Error('Authentication required');
        (error as any).statusCode = 401;
        return next(error);
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
        const error = new Error('Authentication required');
        (error as any).statusCode = 401;
        return next(error);
      }
      
      const { provider } = req.params;
      const { redirectUrl } = req.body;
      
      // Validate provider
      if (!Object.values(KycProvider).includes(provider as KycProvider)) {
        const error = new Error(`Unsupported provider: ${provider}`);
        (error as any).statusCode = 400;
        return next(error);
      }
      
      // Validate redirect URL
      if (!redirectUrl || typeof redirectUrl !== 'string') {
        const error = new Error('Invalid redirect URL');
        (error as any).statusCode = 400;
        return next(error);
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
        const error = new Error('User ID is required');
        (error as any).statusCode = 400;
        return next(error);
      }
      
      const kycRecord = await this.kycService.syncKycStatus(userId);
      
      if (!kycRecord) {
        const error = new Error('KYC record not found or no provider information available');
        (error as any).statusCode = 404;
        return next(error);
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
        const error = new Error('Validation error');
        (error as any).statusCode = 400;
        (error as any).details = validationResult.error.format();
        return next(error);
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
        const error = new Error('User ID is required');
        (error as any).statusCode = 400;
        return next(error);
      }

      const kycRecord = await this.kycService.getByUserId(userId);

      if (!kycRecord) {
        const error = new Error('KYC record not found');
        (error as any).statusCode = 404;
        return next(error);
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
        const error = new Error('User ID is required');
        (error as any).statusCode = 400;
        return next(error);
      }

      // Validate request body
      const validationResult = KycUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        const error = new Error('Validation error');
        (error as any).statusCode = 400;
        (error as any).details = validationResult.error.format();
        return next(error);
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

// Create singleton instance
export const kycController = new KycController(new KycService(null));

