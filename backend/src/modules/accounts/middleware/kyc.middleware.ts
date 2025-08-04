// External packages
import { Response, NextFunction } from 'express';

// Internal modules
import { AuthenticatedRequest } from './auth.middleware';
import { KycService } from '../services/kyc.service';
import { logger } from '../../../utils/logger';
import { prisma } from '../../../prisma/client';
import { accountsLogger } from '../utils/accounts.logger';

// Create a singleton instance of the KYC service
let kycService: KycService | null = null;

/**
 * Get the KYC service instance
 */
function getKycService(): KycService {
  if (!kycService) {
    // Use the shared prisma client
    kycService = new KycService(prisma);
  }
  return kycService;
}

/**
 * Middleware to require verified KYC status
 * This middleware should be used after requireAuth
 */
export const requireKycVerified = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      logger.warn('KYC verification attempted without authentication', {
        action: 'KYC_CHECK_UNAUTHENTICATED',
        module: 'accounts',
        path: req.path,
        method: req.method
      });
      
      accountsLogger.logAuthError('no-user', 'Authentication required', req.method);
      
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        errorCode: 'AUTH_REQUIRED',
        details: {
          requiredAction: 'login',
          suggestion: 'Please login to access this resource'
        }
      });
      return;
    }

    logger.info(`Checking KYC verification status for user ${req.user.id}`, {
      action: 'KYC_VERIFICATION_CHECK',
      module: 'accounts',
      userId: req.user.id,
      path: req.path,
      method: req.method
    });

    const service = getKycService();
    const isVerified = await service.isKycVerified(req.user.id);

    if (!isVerified) {
      logger.warn(`KYC verification required for user ${req.user.id} to access ${req.path}`, {
        action: 'KYC_VERIFICATION_REQUIRED',
        module: 'accounts',
        userId: req.user.id,
        path: req.path,
        method: req.method
      });
      
      // Log KYC verification requirement using standard logger
      logger.warn(`KYC verification required for user ${req.user.id}`, {
        action: 'KYC_VERIFICATION_REQUIRED',
        userId: req.user.id,
        path: req.path,
        method: req.method
      });
      
      res.status(403).json({
        success: false,
        message: 'KYC verification required',
        errorCode: 'KYC_VERIFICATION_REQUIRED',
        details: {
          userId: req.user.id,
          kycStatus: 'NOT_VERIFIED',
          requiredAction: 'Complete KYC verification process',
          kycEndpoint: '/api/kyc/me'
        }
      });
      return;
    }

    logger.info(`KYC verification successful for user ${req.user.id}`, {
      action: 'KYC_VERIFICATION_SUCCESS',
      module: 'accounts',
      userId: req.user.id,
      path: req.path,
      method: req.method
    });

    next();
  } catch (error) {
    const userId = req.user?.id;
    logger.error('KYC verification middleware error', { 
      module: 'accounts',
      userId,
      path: req.path,
      method: req.method
    }, error instanceof Error ? error : new Error(String(error)));
    
    // Log error with accountsLogger
    accountsLogger.logAccountError('requireKycVerified', 
      error instanceof Error ? error : String(error), 
      { userId, path: req.path });
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while checking KYC verification status',
      errorCode: 'KYC_CHECK_ERROR',
      details: {
        serverIssue: true
      }
    });
  }
};
