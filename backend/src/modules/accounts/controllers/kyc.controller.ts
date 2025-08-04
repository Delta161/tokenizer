// External packages
import { NextFunction, Request, Response } from 'express';

// Internal modules
import type { AuthenticatedRequest } from '@/modules/accounts/middleware/auth.middleware';
import { PAGINATION } from '@config/constants';
import { KycService, kycService } from '@modules/accounts/services/kyc.service';
import { KycProvider, KycStatus } from '@modules/accounts/types/kyc.types';
import { KycSubmissionSchema, KycUpdateSchema } from '@modules/accounts/validators/kyc.validator';
import { createUnauthorized, createBadRequest, createNotFound, createForbidden } from '@middleware/errorHandler';
import { createPaginationResult, getSkipValue } from '@utils/pagination';
import { accountsLogger } from '@modules/accounts/utils/accounts.logger';
import { logger } from '@utils/logger';
import { adminLogger } from '@modules/admin/utils/admin.logger';
import { verifySumsubWebhookSignature, mapSumsubStatusToKycStatus } from '@modules/accounts/utils/kycProvider.utils';

export class KycController {
  private kycService: KycService;

  constructor(kycService: KycService) {
    this.kycService = kycService;
  }

  /**
   * Handle Sumsub webhook
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  public handleSumsubWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get signature from header
      const signature = req.headers['x-payload-digest'] as string;
      if (!signature) {
        next(createForbidden('Missing signature'));
        return;
      }

      // Get raw body
      const rawBody = JSON.stringify(req.body);
      
      // Verify signature
      const isValid = verifySumsubWebhookSignature(rawBody, signature);
      if (!isValid) {
        adminLogger.warn('Invalid Sumsub webhook signature');
        next(createForbidden('Invalid signature'));
        return;
      }

      // Extract data from webhook payload
      const { referenceId, status, rejectReason } = req.body;
      
      if (!referenceId) {
        next(createBadRequest('Missing referenceId'));
        return;
      }

      // Map Sumsub status to internal KYC status
      const kycStatus = mapSumsubStatusToKycStatus(status);
      
      // Update KYC record status
      const updateData = {
        status: kycStatus as KycStatus,
        rejectionReason: rejectReason
      };
      
      // Find and update KYC record by provider reference
      const updatedRecord = await this.kycService.updateByProviderReference(
        'sumsub',
        referenceId,
        updateData
      );

      if (!updatedRecord) {
        // Use logAccountError instead of warn
        accountsLogger.logAccountError('handleSumsubWebhook', `KYC record not found for referenceId: ${referenceId}`, { referenceId });
        next(createNotFound('KYC record not found'));
        return;
      }

      // Use logKycStatusUpdate instead of info
      accountsLogger.logKycStatusUpdate(updatedRecord.userId, updatedRecord.status as KycStatus, kycStatus as KycStatus);
      
      // Return success response
      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      // Use logAccountError instead of error
      accountsLogger.logAccountError('handleSumsubWebhook', error as Error);
      next(error);
    }
  };
  
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
        accountsLogger.logAuthError(
          req.ip || 'unknown', 
          'Authentication required for KYC access', 
          'getCurrentUserKyc'
        );
        return next(createUnauthorized(
          'Authentication required', 
          'AUTH_REQUIRED',
          { requiredAction: 'login' }
        ));
      }

      const kycRecord = await this.kycService.getByUserId(req.user.id);
      
      logger.info(`User ${req.user.id} accessed their KYC record`, {
        userId: req.user.id,
        action: 'KYC_RECORD_ACCESS',
        module: 'accounts',
        kycStatus: kycRecord?.status || 'NOT_SUBMITTED'
      });

      res.json({
        success: true,
        data: kycRecord || { status: 'NOT_SUBMITTED' }
      });
    } catch (error) {
      accountsLogger.logAccountError('getCurrentUserKyc', error as Error, { userId: req.user?.id });
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
        accountsLogger.logAuthError(
          req.ip || 'unknown', 
          'Authentication required for KYC verification initiation', 
          'initiateProviderVerification'
        );
        return next(createUnauthorized(
          'Authentication required',
          'AUTH_REQUIRED',
          { requiredAction: 'login' }
        ));
      }
      
      const { provider } = req.params;
      const { redirectUrl } = req.body;
      
      // Validate provider
      if (!Object.values(KycProvider).includes(provider as KycProvider)) {
        logger.warn(`User ${req.user.id} attempted to use invalid KYC provider: ${provider}`, {
          userId: req.user.id,
          action: 'INVALID_KYC_PROVIDER_ATTEMPT',
          module: 'accounts',
          providedValue: provider,
          supportedProviders: Object.values(KycProvider)
        });
        
        return next(createBadRequest(
          `Unsupported provider: ${provider}`,
          'INVALID_KYC_PROVIDER',
          { 
            providedValue: provider,
            supportedProviders: Object.values(KycProvider)
          }
        ));
      }
      
      // Validate redirect URL
      if (!redirectUrl || typeof redirectUrl !== 'string') {
        logger.warn(`User ${req.user.id} provided invalid redirect URL for KYC verification`, {
          userId: req.user.id,
          action: 'INVALID_REDIRECT_URL',
          module: 'accounts',
          providedValue: redirectUrl
        });
        
        return next(createBadRequest(
          'Invalid redirect URL',
          'INVALID_REDIRECT_URL',
          { 
            providedValue: redirectUrl,
            expectedType: 'string',
            requiredFormat: 'A valid URL string'
          }
        ));
      }
      
      // Log KYC verification initiation
      accountsLogger.logKycVerificationInitiated(req.user.id, provider);
      
      const session = await this.kycService.initiateProviderVerification(
        req.user.id,
        provider as KycProvider,
        redirectUrl
      );
      
      logger.info(`User ${req.user.id} initiated KYC verification with provider ${provider}`, {
        userId: req.user.id,
        action: 'KYC_VERIFICATION_INITIATED',
        module: 'accounts',
        provider,
        referenceId: session.referenceId
      });
      
      res.status(200).json({
        success: true,
        data: {
          redirectUrl: session.redirectUrl,
          expiresAt: session.expiresAt,
          referenceId: session.referenceId
        }
      });
    } catch (error) {
      accountsLogger.logAccountError('initiateProviderVerification', error as Error, { 
        userId: req.user?.id,
        provider: req.params?.provider 
      });
      next(error);
    }
  };
  
  /**
   * Sync KYC record status with provider
   */
  syncKycStatus = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const adminId = req.user?.id;
      
      if (!userId) {
        logger.warn('KYC sync attempted without user ID', {
          action: 'KYC_SYNC_MISSING_USER_ID',
          module: 'accounts',
          adminId
        });
        
        return next(createBadRequest(
          'User ID is required',
          'MISSING_USER_ID',
          { 
            parameter: 'userId',
            location: 'path',
            required: true 
          }
        ));
      }
      
      logger.info(`Syncing KYC status for user ${userId}${adminId ? ` by admin ${adminId}` : ''}`, {
        action: 'KYC_SYNC_INITIATED',
        module: 'accounts',
        userId,
        adminId
      });
      
      const kycRecord = await this.kycService.syncKycStatus(userId);
      
      if (!kycRecord) {
        logger.warn(`KYC record not found for user ${userId} during sync attempt`, {
          action: 'KYC_RECORD_NOT_FOUND',
          module: 'accounts',
          userId,
          adminId
        });
        
        return next(createNotFound(
          'KYC record not found',
          'KYC_RECORD_NOT_FOUND',
          { 
            userId,
            suggestion: 'Ensure the user has initiated KYC verification' 
          }
        ));
      }
      
      logger.info(`KYC status synced successfully for user ${userId}`, {
        action: 'KYC_SYNC_COMPLETED',
        module: 'accounts',
        userId,
        adminId,
        kycStatus: kycRecord.status
      });
      
      res.json({
        success: true,
        data: kycRecord
      });
    } catch (error) {
      const userId = req.params?.userId;
      accountsLogger.logAccountError('syncKycStatus', error as Error, { 
        userId,
        adminId: req.user?.id 
      });
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
        accountsLogger.logAuthError(
          req.ip || 'unknown', 
          'Authentication required for KYC submission', 
          'submitKyc'
        );
        return next(createUnauthorized(
          'Authentication required',
          'AUTH_REQUIRED',
          { requiredAction: 'login' }
        ));
      }
      
      // Validate submission data
      const result = KycSubmissionSchema.safeParse(req.body);
      
      if (!result.success) {
        logger.warn(`User ${req.user.id} submitted invalid KYC data`, {
          userId: req.user.id,
          action: 'INVALID_KYC_SUBMISSION',
          module: 'accounts',
          validationErrors: result.error.format()
        });
        
        return next(createBadRequest(
          'Invalid KYC submission data',
          'INVALID_KYC_DATA',
          { 
            validationErrors: result.error.format(),
            receivedData: req.body
          }
        ));
      }
      
      logger.info(`User ${req.user.id} submitting KYC information`, {
        userId: req.user.id,
        action: 'KYC_SUBMISSION_INITIATED',
        module: 'accounts',
        documentType: result.data.documentType,
        country: result.data.country
      });
      
      const kycRecord = await this.kycService.submitKyc(req.user.id, result.data);
      
      // Log successful KYC submission
      accountsLogger.logKycSubmission(req.user.id, result.data.documentType);
      
      logger.info(`User ${req.user.id} successfully submitted KYC information`, {
        userId: req.user.id,
        action: 'KYC_SUBMISSION_COMPLETED',
        module: 'accounts',
        kycStatus: kycRecord.status,
        kycId: kycRecord.id
      });
      
      res.status(201).json({
        success: true,
        data: kycRecord
      });
    } catch (error) {
      accountsLogger.logAccountError('submitKyc', error as Error, { userId: req.user?.id });
      next(error);
    }
  };

  /**
   * Get all KYC records (admin only) with pagination
   */
  getAllKycRecords = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminId = (req as AuthenticatedRequest).user?.id;
      
      // Get pagination parameters from req.pagination (set by paginationMiddleware)
      // or fall back to default values
      const page = req.pagination?.page || PAGINATION.DEFAULT_PAGE;
      const limit = req.pagination?.limit || PAGINATION.DEFAULT_LIMIT;
      const skip = req.pagination?.skip || getSkipValue(page, limit);
      
      logger.info(`Admin ${adminId} requesting all KYC records (page ${page}, limit ${limit})`, {
        action: 'KYC_RECORDS_LIST_REQUEST',
        module: 'accounts',
        adminId,
        pagination: { page, limit, skip }
      });
      
      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > PAGINATION.MAX_LIMIT) {
        logger.warn(`Admin ${adminId} provided invalid pagination parameters`, {
          action: 'INVALID_PAGINATION',
          module: 'accounts',
          adminId,
          receivedValues: { page, limit }
        });
        
        return next(createBadRequest(
          'Invalid pagination parameters',
          'INVALID_PAGINATION',
          { 
            receivedValues: { page, limit },
            validRanges: {
              page: 'Minimum value: 1',
              limit: `Range: 1-${PAGINATION.MAX_LIMIT}`
            }
          }
        ));
      }
      
      // Get KYC records with pagination
      const { kycRecords, total } = await this.kycService.getAllKycRecords(page, limit);
      
      // Create pagination result
      const result = createPaginationResult(kycRecords, total, { page, limit, skip });
      
      logger.info(`Admin ${adminId} retrieved ${kycRecords.length} KYC records (total: ${total})`, {
        action: 'KYC_RECORDS_LIST_SUCCESS',
        module: 'accounts',
        adminId,
        recordCount: kycRecords.length,
        totalRecords: total
      });
      
      res.json(result);
    } catch (error) {
      const adminId = (req as AuthenticatedRequest).user?.id;
      accountsLogger.logAccountError('getAllKycRecords', error as Error, { adminId });
      next(error);
    }
  };

  /**
   * Get KYC record by user ID (admin only)
   */
  getUserKyc = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const adminId = (req as AuthenticatedRequest).user?.id;
      
      if (!userId) {
        logger.warn(`Admin ${adminId} attempted to view KYC record without providing user ID`, {
          action: 'KYC_VIEW_MISSING_USER_ID',
          module: 'accounts',
          adminId
        });
        
        return next(createBadRequest(
          'User ID is required',
          'MISSING_USER_ID',
          { 
            parameter: 'userId',
            location: 'path',
            required: true 
          }
        ));
      }
      
      logger.info(`Admin ${adminId} requesting KYC record for user ${userId}`, {
        action: 'KYC_RECORD_VIEW_REQUEST',
        module: 'accounts',
        adminId,
        targetUserId: userId
      });
      
      const kycRecord = await this.kycService.getByUserId(userId);
      
      if (!kycRecord) {
        logger.warn(`KYC record not found for user ${userId} during admin view attempt`, {
          action: 'KYC_RECORD_NOT_FOUND',
          module: 'accounts',
          adminId,
          targetUserId: userId
        });
        
        return next(createNotFound(
          'KYC record not found',
          'KYC_RECORD_NOT_FOUND',
          { 
            userId,
            suggestion: 'The user may not have submitted KYC information yet' 
          }
        ));
      }
      
      // Log KYC record view by admin
      if (adminId) {
        adminLogger.logKycRecordView(kycRecord.id, adminId);
      }
      
      logger.info(`Admin ${adminId} successfully viewed KYC record for user ${userId}`, {
        action: 'KYC_RECORD_VIEW_SUCCESS',
        module: 'accounts',
        adminId,
        targetUserId: userId,
        kycStatus: kycRecord.status
      });
      
      res.json({
        success: true,
        data: kycRecord
      });
    } catch (error) {
      const adminId = (req as AuthenticatedRequest).user?.id;
      const userId = req.params?.userId;
      accountsLogger.logAccountError('getUserKyc', error as Error, { adminId, targetUserId: userId });
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
      const adminId = (req as AuthenticatedRequest).user?.id;
      
      if (!userId) {
        logger.warn(`Admin ${adminId} attempted to update KYC status without providing user ID`, {
          action: 'KYC_UPDATE_MISSING_USER_ID',
          module: 'accounts',
          adminId
        });
        
        return next(createBadRequest(
          'User ID is required',
          'MISSING_USER_ID',
          { 
            parameter: 'userId',
            location: 'path',
            required: true 
          }
        ));
      }
      
      // Validate request body
      const validationResult = KycUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        logger.warn(`Admin ${adminId} provided invalid data for KYC status update for user ${userId}`, {
          action: 'INVALID_KYC_UPDATE_DATA',
          module: 'accounts',
          adminId,
          targetUserId: userId,
          validationErrors: validationResult.error.format()
        });
        
        return next(createBadRequest(
          'Invalid KYC update data',
          'INVALID_KYC_UPDATE',
          { 
            validationErrors: validationResult.error.format(),
            receivedData: req.body,
            note: 'If status is REJECTED, rejectionReason is required'
          }
        ));
      }

      logger.info(`Admin ${adminId} updating KYC status for user ${userId} to ${validationResult.data.status}`, {
        action: 'KYC_STATUS_UPDATE_INITIATED',
        module: 'accounts',
        adminId,
        targetUserId: userId,
        newStatus: validationResult.data.status,
        rejectionReason: validationResult.data.rejectionReason
      });

      // Get current KYC record to log status change
      const currentRecord = await this.kycService.getByUserId(userId);
      const oldStatus = currentRecord?.status;

      const kycRecord = await this.kycService.updateKycStatus(
        userId,
        validationResult.data
      );

      // Log KYC status update
      accountsLogger.logKycStatusUpdate(
        userId, 
        (oldStatus || KycStatus.NOT_SUBMITTED) as KycStatus, 
        kycRecord.status as KycStatus,
        adminId
      );

      logger.info(`Admin ${adminId} successfully updated KYC status for user ${userId} from ${oldStatus || 'NOT_SUBMITTED'} to ${kycRecord.status}`, {
        action: 'KYC_STATUS_UPDATE_COMPLETED',
        module: 'accounts',
        adminId,
        targetUserId: userId,
        oldStatus: oldStatus || 'NOT_SUBMITTED',
        newStatus: kycRecord.status,
        kycId: kycRecord.id
      });

      res.json({
        success: true,
        data: kycRecord
      });
    } catch (error) {
      const adminId = (req as AuthenticatedRequest).user?.id;
      const userId = req.params?.userId;
      accountsLogger.logAccountError('updateKycStatus', error as Error, { adminId, targetUserId: userId });
      next(error);
    }
  };
}

// Create singleton instance
export const kycController = KycController.getInstance();

