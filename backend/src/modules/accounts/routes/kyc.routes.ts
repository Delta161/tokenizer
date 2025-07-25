// External packages
import { Router } from 'express';

// Internal modules
import { KycController } from '@modules/accounts/controllers/kyc.controller';
import { authGuard, roleGuard } from '@/middleware/auth.middleware';
import { paginationMiddleware } from '@/middleware/pagination';
import { UserRole } from '@modules/accounts/types/auth.types';
import { json } from 'express';

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

  // Webhook endpoints
  // Use raw JSON parser for webhook to access raw body for signature verification
  router.post('/webhook/sumsub', json(), kycController.handleSumsubWebhook);

  // Admin endpoints
  router.get('/admin', authGuard, roleGuard(UserRole.ADMIN), paginationMiddleware, kycController.getAllKycRecords);
  router.get('/admin/:userId', authGuard, roleGuard(UserRole.ADMIN), kycController.getUserKyc);
  router.patch('/admin/:userId', authGuard, roleGuard(UserRole.ADMIN), kycController.updateKycStatus);
  router.post('/admin/:userId/sync', authGuard, roleGuard(UserRole.ADMIN), kycController.syncKycStatus);

  return router;
}

export default createKycRoutes;

