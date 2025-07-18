import { NetworkConfig } from '../types/smartContract.types';
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
 * Network configurations
 */
export declare const NETWORKS: Record<string, NetworkConfig>;
/**
 * Get network configuration by chain ID
 * @param chainId - Blockchain network ID
 * @returns Network configuration or undefined if not found
 */
export declare const getNetworkConfig: (chainId: number | string) => NetworkConfig | undefined;
/**
 * Default chain ID to use if none specified
 */
export declare const DEFAULT_CHAIN_ID = 11155111;
//# sourceMappingURL=smartContract.config.d.ts.map