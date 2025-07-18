import { Router } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { requireAuth } from '../../auth/requireAuth.js';
import { requireRole } from '../../auth/requireRole.js';
import { KycController } from '../controllers/kyc.controller.js';

export function createKycRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const kycController = new KycController(prisma);

  // User endpoints
  router.get('/me', requireAuth, kycController.getCurrentUserKyc);
  router.post('/submit', requireAuth, kycController.submitKyc);
  router.post('/provider/:provider/initiate', requireAuth, kycController.initiateProviderVerification);

  // Admin endpoints
  router.get('/admin', requireAuth, requireRole(UserRole.ADMIN), kycController.getAllKycRecords);
  router.get('/admin/:userId', requireAuth, requireRole(UserRole.ADMIN), kycController.getUserKyc);
  router.patch('/admin/:userId', requireAuth, requireRole(UserRole.ADMIN), kycController.updateKycStatus);
  router.post('/admin/:userId/sync', requireAuth, requireRole(UserRole.ADMIN), kycController.syncKycStatus);

  return router;
}

export default createKycRoutes;