import { Router } from 'express';
import { authGuard, roleGuard } from '../middleware/auth.middleware';
import { KycController } from '../controllers/kyc.controller';
import { UserRole } from '../types/auth.types';

/**
 * Create KYC routes
 * @param kycController KYC controller instance
 * @returns Express router
 */
export function createKycRoutes(kycController: KycController): Router {
  const router = Router();

  // User endpoints
  router.get('/me', authGuard, kycController.getCurrentUserKyc);
  router.post('/submit', authGuard, kycController.submitKyc);
  router.post('/provider/:provider/initiate', authGuard, kycController.initiateProviderVerification);

  // Admin endpoints
  router.get('/admin', authGuard, roleGuard(UserRole.ADMIN), kycController.getAllKycRecords);
  router.get('/admin/:userId', authGuard, roleGuard(UserRole.ADMIN), kycController.getUserKyc);
  router.patch('/admin/:userId', authGuard, roleGuard(UserRole.ADMIN), kycController.updateKycStatus);
  router.post('/admin/:userId/sync', authGuard, roleGuard(UserRole.ADMIN), kycController.syncKycStatus);

  return router;
}

export default createKycRoutes;