import { SmartContractService, getSmartContractConfig } from './smartContract.service.js';
import { SmartContractController } from './controllers/smartContract.controller.js';
import { smartContractRoutes } from './routes/smartContract.routes.js';
import { PrismaClient } from '@prisma/client';

export function initSmartContractModule(prisma: PrismaClient) {
  const config = getSmartContractConfig();
  const smartContractService = new SmartContractService(config);
  const smartContractController = new SmartContractController(smartContractService, prisma);
  
  return {
    service: smartContractService,
    controller: smartContractController,
    routes: smartContractRoutes(smartContractController)
  };
}

export * from './types/smartContract.types.js';
export * from './utils/contract.utils.js';