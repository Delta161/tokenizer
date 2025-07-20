import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { KycService } from './kyc.service';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';

// Create a singleton instance of the KYC service
let kycService: KycService | null = null;

/**
 * Get the KYC service instance
 */
function getKycService(): KycService {
  if (!kycService) {
    const prisma = new PrismaClient();
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
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
      return;
    }

    const service = getKycService();
    const isVerified = await service.isKycVerified(req.user.id);

    if (!isVerified) {
      res.status(403).json({
        success: false,
        error: 'KYC verification required',
        message: 'You must complete KYC verification to access this resource',
        kycStatus: 'NOT_VERIFIED'
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('KYC verification middleware error', { module: 'kyc' }, error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while checking KYC verification status'
    });
  }
};