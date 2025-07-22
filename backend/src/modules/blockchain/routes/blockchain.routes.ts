import { Router } from 'express';
import { BlockchainController } from '../controllers/blockchain.controller.js';
import { PrismaClient } from '@prisma/client';
import { BlockchainService } from '../services/blockchain.service.js';
import { isAuthenticated } from '../../accounts/middleware/auth.middleware.js';
import { hasRole } from '../../accounts/middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';
import { getBlockchainConfig } from '../services/blockchain.service.js';

const prisma = new PrismaClient();
const config = getBlockchainConfig();
const blockchainService = new BlockchainService(config);
const blockchainController = new BlockchainController(blockchainService, prisma);

const router = Router();

// Public routes
router.get('/validate/:contractAddress', blockchainController.validateContract.bind(blockchainController));
router.get('/metadata/:contractAddress', blockchainController.getTokenMetadata.bind(blockchainController));
router.get('/balance', blockchainController.getBalanceOf.bind(blockchainController));
router.get('/gas-price', blockchainController.getGasPrice.bind(blockchainController));
router.get('/network-config', blockchainController.getNetworkConfig.bind(blockchainController));
router.get('/contracts', blockchainController.getAvailableContracts.bind(blockchainController));
router.get('/contracts/:contractName', blockchainController.getContractAddress.bind(blockchainController));

// Protected routes (require authentication)
router.post('/transaction-receipt', isAuthenticated, blockchainController.getTransactionReceipt.bind(blockchainController));

// Admin only routes
router.post('/mint', isAuthenticated, hasRole(UserRole.ADMIN), blockchainController.mintTokens.bind(blockchainController));
router.post('/transfer', isAuthenticated, hasRole(UserRole.ADMIN), blockchainController.transferTokens.bind(blockchainController));

export default router;