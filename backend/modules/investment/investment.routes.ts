import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../auth/requireAuth.js';
import { requireAdmin, requireInvestor } from '../auth/requireRole.js';
import { InvestmentController } from './investment.controller.js';
import { requireKycVerified } from '../kyc/index.js';

export function createInvestmentRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const controller = new InvestmentController(prisma);

  // Investor endpoints - require KYC verification
  router.post('/investments/create', requireAuth, requireInvestor, requireKycVerified, controller.create);
  router.get('/investments/me', requireAuth, requireInvestor, controller.getMyInvestments);

  // Admin endpoints
  router.get('/investments', requireAuth, requireAdmin, controller.getAll);
  router.get('/investments/:id', requireAuth, requireAdmin, controller.getById);
  router.patch('/investments/:id/status', requireAuth, requireAdmin, controller.updateStatus);

  return router;
}

export default createInvestmentRoutes;