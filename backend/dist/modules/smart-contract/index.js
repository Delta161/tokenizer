import { SmartContractService, getSmartContractConfig } from './smartContract.service.js';
import { SmartContractController } from './controllers/smartContract.controller.js';
import { smartContractRoutes } from './routes/smartContract.routes.js';
export function initSmartContractModule(prisma) {
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
export { DEFAULT_CHAIN_ID, getNetworkConfig } from './config/smartContract.config.js';
//# sourceMappingURL=index.js.map