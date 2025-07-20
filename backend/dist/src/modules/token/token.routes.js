import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { TokenController } from './token.controller';
import { authGuard } from '../accounts/middleware/auth.middleware';
import { roleGuard } from '../accounts/middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import { kycVerifiedGuard } from '../accounts/middleware/kyc.middleware';
import { SmartContractService, getSmartContractConfig } from '../../services/smartContract.service';
/**
 * Creates and configures the token routes
 * @returns Express Router with token routes
 */
export function createTokenRoutes() {
    const router = Router();
    const prisma = new PrismaClient();
    const smartContractService = new SmartContractService(getSmartContractConfig());
    const controller = new TokenController(prisma, smartContractService);
    // Public routes
    // None
    // User routes (requires authentication)
    router.get('/public', authGuard, roleGuard([UserRole.INVESTOR]), controller.getAllPublic);
    // Blockchain endpoints - require KYC verification for token balance
    router.get('/blockchain/balance', authGuard, kycVerifiedGuard, controller.getTokenBalance);
    router.get('/blockchain/metadata/:contractAddress', authGuard, controller.getBlockchainMetadata);
    // Admin routes
    router.post('/', authGuard, roleGuard([UserRole.ADMIN]), controller.create);
    router.get('/', authGuard, roleGuard([UserRole.ADMIN]), controller.getAll);
    router.get('/:id', authGuard, roleGuard([UserRole.ADMIN]), controller.getById);
    router.patch('/:id', authGuard, roleGuard([UserRole.ADMIN]), controller.update);
    router.delete('/:id', authGuard, roleGuard([UserRole.ADMIN]), controller.delete);
    return router;
}
//# sourceMappingURL=token.routes.js.map