import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authGuard, roleGuard } from '@/middleware/auth.middleware';
import { requireKycVerified } from '@/middleware/kyc.middleware';
import { InvestmentController } from '../controllers/investment.controller';
import { logger } from '@/utils/logger';

/**
 * Creates and configures investment routes
 * @param prisma - Prisma client instance
 * @returns Configured Express router
 */
export function createInvestmentRoutes(prisma: PrismaClient): Router {
  logger.info('Initializing investment routes');
  
  const router = Router();
  const controller = new InvestmentController(prisma);

  // Investor endpoints - require KYC verification
  router.post('/', authGuard, roleGuard(['INVESTOR']), requireKycVerified, controller.create);
  router.get('/me', authGuard, roleGuard(['INVESTOR']), controller.getMyInvestments);

  // Admin endpoints
  router.get('/', authGuard, roleGuard(['ADMIN']), controller.getAll);
  router.get('/:id', authGuard, roleGuard(['ADMIN', 'INVESTOR']), controller.getById);
  router.patch('/:id/status', authGuard, roleGuard(['ADMIN']), controller.updateStatus);

  logger.info('Investment routes initialized successfully');
  return router;
}

export default createInvestmentRoutes;
