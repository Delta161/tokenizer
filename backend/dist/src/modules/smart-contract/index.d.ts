import { Router } from 'express';
import { getSmartContractConfig } from './smartContract.config.js';
import { validateAddress, validateTxHash } from './smartContract.utils.js';
export * from './smartContract.types.js';
export { validateAddress, validateTxHash, getSmartContractConfig };
/**
 * Initialize the smart contract module
 * @returns Router instance for the smart contract module
 */
export declare function initSmartContractModule(): Router;
export default initSmartContractModule;
//# sourceMappingURL=index.d.ts.map