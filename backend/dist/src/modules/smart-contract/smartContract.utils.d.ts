/**
 * Validates an Ethereum address
 * @param address The address to validate
 * @returns boolean indicating if the address is valid
 */
export declare function validateAddress(address: string): boolean;
/**
 * Loads a contract ABI from a JSON file
 * @param artifactPath Path to the contract artifact JSON file
 * @returns The contract ABI
 */
export declare function loadContractABI(artifactPath: string): any;
/**
 * Resolves the path to a contract artifact
 * @param artifactFileName The name of the artifact file
 * @returns The full path to the artifact file
 */
export declare function resolveArtifactPath(artifactFileName: string): string;
/**
 * Validates a transaction hash
 * @param txHash The transaction hash to validate
 * @returns boolean indicating if the hash is valid
 */
export declare function validateTxHash(txHash: string): boolean;
/**
 * Formats an amount with the specified number of decimals
 * @param amount The amount to format
 * @param decimals The number of decimals
 * @returns The formatted amount as a string
 */
export declare function formatAmount(amount: string | number, decimals: number): string;
/**
 * Alias for formatAmount for backward compatibility
 */
export declare const formatTokenAmount: typeof formatAmount;
/**
 * Parses an amount from the specified number of decimals to a human-readable format
 * @param amount The amount to parse
 * @param decimals The number of decimals
 * @returns The parsed amount as a string
 */
export declare function parseAmount(amount: string | number, decimals: number): string;
/**
 * Alias for parseAmount for backward compatibility
 */
export declare const parseTokenAmount: typeof parseAmount;
/**
 * Gets the short address format (e.g., 0x1234...5678)
 * @param address The full Ethereum address
 * @returns The shortened address
 */
export declare function getShortAddress(address: string): string;
//# sourceMappingURL=smartContract.utils.d.ts.map