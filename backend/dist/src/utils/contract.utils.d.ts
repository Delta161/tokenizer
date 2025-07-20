/**
 * Contract Utilities
 * Helper functions for blockchain contract interactions
 */
/**
 * Validates an Ethereum address
 * @param address The address to validate
 * @returns True if the address is valid
 */
export declare function validateAddress(address: string): boolean;
/**
 * Validates a transaction hash
 * @param txHash The transaction hash to validate
 * @returns True if the hash is valid
 */
export declare function validateTxHash(txHash: string): boolean;
/**
 * Formats a token amount with the correct number of decimals
 * @param amount The amount to format
 * @param decimals The number of decimals
 * @returns The formatted amount
 */
export declare function formatTokenAmount(amount: string | number, decimals: number): string;
/**
 * Loads a contract ABI from a JSON file
 * @param filePath Path to the contract artifact JSON file
 * @returns The contract ABI
 */
export declare function loadContractABI(filePath: string): any[];
/**
 * Resolves the path to a contract artifact file
 * @param fileName The name of the artifact file
 * @returns The resolved path
 */
export declare function resolveArtifactPath(fileName: string): string;
//# sourceMappingURL=contract.utils.d.ts.map