import { Router } from 'express';
import { SmartContractController } from './smartContract.controller.js';
import { PrismaClient } from '@prisma/client';
import { SmartContractService } from './smartContract.service.js';
import { isAuthenticated } from '../auth/auth.middleware.js';
import { hasRole } from '../auth/auth.middleware.js';
import { UserRole } from '@prisma/client';
import { getSmartContractConfig } from './smartContract.config.js';
const prisma = new PrismaClient();
const config = getSmartContractConfig();
const smartContractService = new SmartContractService(config);
const smartContractController = new SmartContractController(smartContractService, prisma);
const router = Router();
// Public routes
router.get('/validate/:contractAddress', smartContractController.validateContract.bind(smartContractController));
router.get('/metadata/:contractAddress', smartContractController.getTokenMetadata.bind(smartContractController));
router.get('/balance', smartContractController.getBalanceOf.bind(smartContractController));
router.get('/gas-price', smartContractController.getGasPrice.bind(smartContractController));
router.get('/network-config', smartContractController.getNetworkConfig.bind(smartContractController));
// Protected routes (require authentication)
router.post('/transaction-receipt', isAuthenticated, smartContractController.getTransactionReceipt.bind(smartContractController));
// Admin only routes
router.post('/mint', isAuthenticated, hasRole(UserRole.ADMIN), smartContractController.mintTokens.bind(smartContractController));
router.post('/transfer', isAuthenticated, hasRole(UserRole.ADMIN), smartContractController.transferTokens.bind(smartContractController));
export default router;
//# sourceMappingURL=smartContract.routes.js.map