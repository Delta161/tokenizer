import { PrismaClient } from '@prisma/client';
import { SmartContractService } from './smartContract.service.js';
import { SmartContractController } from './smartContract.controller.js';
import smartContractRoutes from './smartContract.routes.js';
import { getSmartContractConfig } from './smartContract.config.js';
import { validateAddress, validateTxHash } from './smartContract.utils.js';
// Export types
export * from './smartContract.types.js';
// Export utilities
export { validateAddress, validateTxHash, getSmartContractConfig };
/**
 * Initialize the smart contract module
 * @returns Router instance for the smart contract module
 */
export function initSmartContractModule() {
    const prisma = new PrismaClient();
    const config = getSmartContractConfig();
    const smartContractService = new SmartContractService(config);
    const smartContractController = new SmartContractController(smartContractService, prisma);
    return smartContractRoutes;
}
export default initSmartContractModule;
//# sourceMappingURL=index.js.map