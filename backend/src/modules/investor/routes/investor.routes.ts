import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { InvestorController } from '../controllers/investor.controller.js';
import { authGuard, requireRole } from '../../accounts/middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';
import { investorLogger } from '../utils/investor.logger.js';

/**
 * Creates and configures the investor routes
 * @returns Configured Express router
 */
export function createInvestorRoutes(): Router {
  investorLogger.info('Initializing investor routes');
  const router = Router();
  const controller = new InvestorController();

  // Public routes - no authentication required
  // None for investor module

  // User routes - authentication required
  router.post('/apply', authGuard, controller.applyAsInvestor);
  router.get('/me', authGuard, requireRole([UserRole.INVESTOR]), controller.getCurrentInvestorProfile);
  router.patch('/me', authGuard, requireRole([UserRole.INVESTOR]), controller.updateCurrentInvestorProfile);
  
  // Wallet management routes
  router.post('/me/wallets', authGuard, requireRole([UserRole.INVESTOR]), controller.addWallet);
  router.delete('/me/wallets/:walletId', authGuard, requireRole([UserRole.INVESTOR]), controller.deleteWallet);

  // Admin routes - admin role required
  router.get('/', authGuard, requireRole([UserRole.ADMIN]), controller.getAllInvestors);
  router.get('/:id', authGuard, requireRole([UserRole.ADMIN]), controller.getInvestorProfileById);
  router.patch('/:id/verification', authGuard, requireRole([UserRole.ADMIN]), controller.updateInvestorVerification);
  router.patch('/wallets/:walletId/verification', authGuard, requireRole([UserRole.ADMIN]), controller.updateWalletVerification);

  return router;
}

// Create default router instance
export const investorRoutes = createInvestorRoutes();