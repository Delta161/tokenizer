import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authGuard, roleGuard } from '../accounts';
import { requireKycVerified } from '../accounts';
import { InvestmentController } from './investment.controller';

export function createInvestmentRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const controller = new InvestmentController(prisma);

  // Investor endpoints - require KYC verification
  router.post('/investments/create', authGuard, roleGuard(['INVESTOR']), requireKycVerified, controller.create);
  router.get('/investments/me', authGuard, roleGuard(['INVESTOR']), controller.getMyInvestments);

  // Admin endpoints
  router.get('/investments', authGuard, roleGuard(['ADMIN']), controller.getAll);
  router.get('/investments/:id', authGuard, roleGuard(['ADMIN']), controller.getById);
  router.patch('/investments/:id/status', authGuard, roleGuard(['ADMIN']), controller.updateStatus);

  return router;
}

export default createInvestmentRoutes;
