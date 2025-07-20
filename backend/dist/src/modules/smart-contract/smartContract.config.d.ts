import { NetworkConfig } from './smartContract.types.js';
/**
 * Default gas limit for transactions
 */
export declare const DEFAULT_GAS_LIMIT: number;
/**
 * Default gas price in wei
 */
export declare const DEFAULT_GAS_PRICE: number;
/**
 * Private key for signing transactions
 */
export declare const PRIVATE_KEY: string;
/**
 * Contract owner address
 */
export declare const CONTRACT_OWNER_ADDRESS: string;
/**
 * Path to contract artifacts
 */
export declare const CONTRACT_ARTIFACTS_PATH: string;
/**
 * Default chain ID
 */
export declare const DEFAULT_CHAIN_ID: number;
/**
 * Network configurations
 */
export declare const NETWORKS: Record<string, NetworkConfig>;
/**
 * Get network configuration by chain ID
 * @param chainId The chain ID
 * @returns The network configuration
 */
export declare function getNetworkConfig(chainId: number): NetworkConfig;
//# sourceMappingURL=smartContract.config.d.ts.map