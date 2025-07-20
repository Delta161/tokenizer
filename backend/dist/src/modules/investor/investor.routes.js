import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { InvestorController } from './investor.controller.js';
import { authGuard, roleGuard } from '../auth/index.js';
/**
 * Creates and configures the investor routes
 * @param prisma PrismaClient instance for database access
 * @returns Configured Express router
 */
export function createInvestorRoutes(prisma = new PrismaClient()) {
    const router = Router();
    const controller = new InvestorController(prisma);
    // Public routes - no authentication required
    // None for investor module
    // User routes - authentication required
    router.post('/apply', authGuard, controller.applyAsInvestor);
    router.get('/me', authGuard, roleGuard('INVESTOR'), controller.getCurrentInvestorProfile);
    router.patch('/me', authGuard, roleGuard('INVESTOR'), controller.updateCurrentInvestorProfile);
    // Wallet management routes
    router.post('/me/wallets', authGuard, roleGuard('INVESTOR'), controller.addWallet);
    router.delete('/me/wallets/:walletId', authGuard, roleGuard('INVESTOR'), controller.deleteWallet);
    // Admin routes - admin role required
    router.get('/', authGuard, roleGuard('ADMIN'), controller.getAllInvestors);
    router.get('/:id', authGuard, roleGuard('ADMIN'), controller.getInvestorProfileById);
    router.patch('/:id/verification', authGuard, roleGuard('ADMIN'), controller.updateInvestorVerification);
    router.patch('/wallets/:walletId/verification', authGuard, roleGuard('ADMIN'), controller.updateWalletVerification);
    return router;
}
// Create default router instance
export const investorRoutes = createInvestorRoutes();
//# sourceMappingURL=investor.routes.js.map