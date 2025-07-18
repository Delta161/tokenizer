import express, { Router } from 'express';
import { KycProviderController } from './kycProvider.controller.js';
import { requireAuth } from '../../auth/middleware/requireAuth.js';
import { requireAdmin } from '../../auth/middleware/requireAdmin.js';

/**
 * Create KYC provider routes
 */
export function createKycProviderRoutes(kycProviderController: KycProviderController): Router {
  const router = express.Router();
  
  // User endpoints
  router.post('/initiate/:provider', requireAuth, kycProviderController.initiateVerification);
  
  // Admin endpoints
  router.get('/status/:userId', requireAuth, requireAdmin, kycProviderController.getVerificationStatus);
  
  return router;
}