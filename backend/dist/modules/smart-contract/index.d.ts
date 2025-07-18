import { SmartContractService } from './smartContract.service.js';
import { SmartContractController } from './controllers/smartContract.controller.js';
import { PrismaClient } from '@prisma/client';
export declare function initSmartContractModule(prisma: PrismaClient): {
    service: SmartContractService;
    controller: SmartContractController;
    routes: import("express").Router;
};
export * from './types/smartContract.types.js';
export * from './utils/contract.utils.js';
export { DEFAULT_CHAIN_ID, getNetworkConfig } from './config/smartContract.config.js';
//# sourceMappingURL=index.d.ts.map