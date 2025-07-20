/**
 * Smart Contract Configuration
 * Configuration for blockchain interactions
 */
import { NetworkConfig } from '../types/smartContract.types';
/**
 * Default gas limit for transactions
 */
export declare const DEFAULT_GAS_LIMIT: number;
/**
 * Default chain ID (Sepolia testnet)
 */
export declare const DEFAULT_CHAIN_ID: number;
/**
 * Network configurations for supported blockchains
 */
export declare const NETWORK_CONFIGS: Record<number, NetworkConfig>;
/**
 * Gets the network configuration for a specific chain ID
 * @param chainId The blockchain network ID
 * @returns The network configuration
 */
export declare function getNetworkConfig(chainId?: number): NetworkConfig;
//# sourceMappingURL=smartContract.config.d.ts.map