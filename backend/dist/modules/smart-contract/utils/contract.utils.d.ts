import { z } from 'zod';
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
 * Formats an amount with the correct number of decimals for a token
 * @param amount The amount to format
 * @param decimals The number of decimals for the token
 * @returns The formatted amount as a string
 */
export declare function formatTokenAmount(amount: string | number, decimals: number): string;
/**
 * Parses an amount from wei to a human-readable format
 * @param amount The amount in wei
 * @param decimals The number of decimals for the token
 * @returns The parsed amount as a string
 */
export declare function parseTokenAmount(amount: string | bigint, decimals: number): string;
/**
 * Zod schema for validating Ethereum addresses
 */
export declare const EthereumAddressSchema: z.ZodString;
/**
 * Zod schema for validating transaction hashes
 */
export declare const TransactionHashSchema: z.ZodString;
//# sourceMappingURL=contract.utils.d.ts.map