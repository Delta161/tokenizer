// External packages
import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';

// Internal modules - Fixed with relative imports
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { KycService, kycService } from '../services/kyc.service';
import { KycProvider, KycStatus } from '../types/kyc.types';
import { KycSubmissionSchema, KycUpdateSchema } from '../validators/kyc.validator';
import { accountsLogger } from '../utils/accounts.logger';
import { verifySumsubWebhookSignature, mapSumsubStatusToKycStatus } from '../utils/kycProvider.utils';
import { createSuccessResponse, createPaginatedResponse } from '../utils/response-formatter';

// Global utilities - Fixed with relative imports
import { createPaginationResult, getSkipValue } from '../../../utils/pagination';
import { logger } from '../../../utils/logger';
import { PAGINATION } from '../../../config/constants';

/**
 * Controller for handling KYC (Know Your Customer) verification operations
 * Manages identity verification processes, KYC submissions, and status tracking
 * Integrates with external KYC providers like Sumsub and handles webhook events
 */
export class KycController {
  private kycService: KycService;

  /**
   * Creates a new KycController instance
   * 
   * @param kycService - The KYC service instance for business logic operations
   */
  constructor(kycService: KycService) {
    this.kycService = kycService;
  }

  /**
   * Handles Sumsub webhook notifications for KYC verification status updates
   * Processes status change events from the Sumsub verification provider
   * 
   * @param req - Express request with Sumsub webhook data
   * @param res - Express response
   * @param next - Express next function for error handling
   * @returns Express response with success status or passes error to next middleware
   * @throws Passes HTTP errors to next middleware if webhook processing fails
   */
   */
  public handleSumsubWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get signature from header
      const signature = req.headers['x-payload-digest'] as string;
      if (!signature) {
        next(createError(403, 'Missing signature'));
        return;
      }

      // Get raw body
      const rawBody = JSON.stringify(req.body);
      
      // Verify signature
      const isValid = verifySumsubWebhookSignature(rawBody, signature);
      if (!isValid) {
        logger.warn('Invalid Sumsub webhook signature');
        next(createError(403, 'Invalid signature'));
        return;
      }

      // Extract data from webhook payload
      const { referenceId, status, rejectReason } = req.body;
      
      if (!referenceId) {
        next(createError(400, 'Missing referenceId'));
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
        next(createError(404, 'KYC record not found'));
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
   * Retrieves the KYC verification record for the currently authenticated user
   * Returns the user's verification status, progress, and relevant data
   * 
   * @param req - Authenticated request with user data attached
   * @param res - Express response object
   * @returns Response with the user's KYC record or error response
   * @throws HttpError if retrieval fails or user is not authenticated
   */
  getCurrentUserKyc = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        accountsLogger.logAuthError(
          req.ip ?? 'unknown', 
          'Authentication required for KYC access', 
          'getCurrentUserKyc'
        );
        return next(createError(401, 'Authentication required'));
      }

      const kycRecord = await this.kycService.getByUserId(req.user.id);
      
      logger.info(`User ${req.user.id} accessed their KYC record`, {
        userId: req.user.id,
        action: 'KYC_RECORD_ACCESS',
        module: 'accounts',
        kycStatus: kycRecord?.status ?? 'NOT_SUBMITTED'
      });

      res.json(createSuccessResponse(
        kycRecord ?? { status: 'NOT_SUBMITTED' },
        'KYC record retrieved successfully'
      ));
    } catch (error) {
      accountsLogger.logAccountError('getCurrentUserKyc', error as Error, { userId: req.user?.id });
      next(error);
    }
  };
  
  /**
   * Initiates KYC verification process with an external provider
   * Creates or retrieves a verification session with the configured KYC provider
   * 
   * @param req - Authenticated request with user data attached
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Response with provider session data or passes error to next middleware
   * @throws HttpError if initiation fails or user is not authenticated
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
        return next(createError(401, 'Authentication required'));
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
        
        return next(createError(400, `Unsupported provider: ${provider}`));
      }
      
      // Validate redirect URL
      if (!redirectUrl || typeof redirectUrl !== 'string') {
        logger.warn(`User ${req.user.id} provided invalid redirect URL for KYC verification`, {
          userId: req.user.id,
          action: 'INVALID_REDIRECT_URL',
          module: 'accounts',
          providedValue: redirectUrl
        });
        
        return next(createError(400, 'Invalid redirect URL'));
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
      
      res.status(200).json(createSuccessResponse(
        {
          redirectUrl: session.redirectUrl,
          expiresAt: session.expiresAt,
          referenceId: session.referenceId
        },
        'KYC verification initiated successfully'
      ));
    } catch (error) {
      accountsLogger.logAccountError('initiateProviderVerification', error as Error, { 
        userId: req.user?.id,
        provider: req.params?.provider 
      });
      next(error);
    }
  };
  
  /**
   * Synchronizes the KYC verification status with the external provider
   * Fetches the latest status from the KYC provider and updates local records
   * 
   * @param req - Authenticated request with user data attached
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Response with updated KYC status or passes error to next middleware
   * @throws HttpError if synchronization fails or user is not authenticated
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
        
        return next(createError(400, 'User ID is required'));
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
        
        return next(createError(404, 'KYC record not found'));
      }
      
      logger.info(`KYC status synced successfully for user ${userId}`, {
        action: 'KYC_SYNC_COMPLETED',
        module: 'accounts',
        userId,
        adminId,
        kycStatus: kycRecord.status
      });
      
      res.json(createSuccessResponse(
        kycRecord,
        'KYC status synced successfully'
      ));
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
   * Submits user KYC information for verification
   * Validates and processes the submitted KYC data from the user
   * 
   * @param req - Authenticated request with user data and KYC submission
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Response with submission result or passes error to next middleware
   * @throws HttpError if submission validation fails or processing fails
   */
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
        return next(createError(401, 'Authentication required'));
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
        
        return next(createError(400, 'Invalid KYC submission data'));
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
   * Retrieves all KYC records with pagination for administrative purposes
   * Admin-only endpoint to review all user verification records
   * 
   * @param req - Express request object with pagination parameters
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Paginated response with KYC records or passes error to next middleware
   * @throws HttpError if retrieval fails or user lacks admin permissions
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
        
        return next(createError(400, 'Invalid pagination parameters'));
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
   * Retrieves a specific user's KYC record by their user ID
   * Admin-only endpoint to view individual user verification status
   * 
   * @param req - Express request object containing userId parameter
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Response with the user's KYC record or passes error to next middleware
   * @throws HttpError if retrieval fails, user not found, or lacks admin permissions
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
        
        return next(createError(400, 'User ID is required'));
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
        
        return next(createError(404, 'KYC record not found'));
      }
      
      // Log KYC record view by admin (removed adminLogger dependency)
      if (adminId) {
        logger.info(`Admin ${adminId} viewed KYC record ${kycRecord.id}`);
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
   * Updates a user's KYC verification status manually
   * Admin-only endpoint to override or manually adjust verification status
   * 
   * @param req - Express request object with userId parameter and status update data
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Response with updated KYC record or passes error to next middleware
   * @throws HttpError if update fails, validation fails, or lacks admin permissions
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
        
        return next(createError(400, 'User ID is required'));
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
        
        return next(createError(400, 'Invalid KYC update data'));
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

      // Fix rejectionReason type (convert null to undefined)
      const updateData = {
        ...validationResult.data,
        rejectionReason: validationResult.data.rejectionReason || undefined
      };

      const kycRecord = await this.kycService.updateKycStatus(
        userId,
        updateData
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

