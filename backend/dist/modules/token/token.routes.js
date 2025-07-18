import { Router } from 'express';
import { requireAuth } from '../auth/requireAuth.js';
import { requireAdmin, requireInvestor } from '../auth/requireRole.js';
import { TokenController } from './token.controller.js';
import { requireKycVerified } from '../kyc/index.js';
import { SmartContractService } from '../smart-contract/smartContract.service.js';
import { getSmartContractConfig } from '../smart-contract/smartContract.service.js';
export function createTokenRoutes(prisma) {
    const router = Router();
    const smartContractService = new SmartContractService(getSmartContractConfig());
    const controller = new TokenController(prisma, smartContractService);
    // Admin endpoints
    router.post('/tokens/create', requireAuth, requireAdmin, controller.create);
    router.get('/tokens', requireAuth, requireAdmin, controller.getAll);
    router.get('/tokens/:id', requireAuth, requireAdmin, controller.getById);
    router.patch('/tokens/:id', requireAuth, requireAdmin, controller.update);
    router.delete('/tokens/:id', requireAuth, requireAdmin, controller.delete);
    // Investor endpoints
    router.get('/tokens/public', requireAuth, requireInvestor, controller.getAllPublic);
    // Blockchain endpoints - require KYC verification for token balance
    router.get('/blockchain/balance', requireAuth, requireKycVerified, controller.getTokenBalance);
    router.get('/blockchain/metadata/:contractAddress', requireAuth, controller.getBlockchainMetadata);
    return router;
}
export default createTokenRoutes;
//# sourceMappingURL=token.routes.js.map