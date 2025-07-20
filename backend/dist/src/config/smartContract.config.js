/**
 * Smart Contract Configuration
 * Configuration for blockchain interactions
 */
import { env } from './env';
/**
 * Default gas limit for transactions
 */
export const DEFAULT_GAS_LIMIT = env.ETH_GAS_LIMIT ? parseInt(env.ETH_GAS_LIMIT) : 3000000;
/**
 * Default chain ID (Sepolia testnet)
 */
export const DEFAULT_CHAIN_ID = env.ETH_CHAIN_ID ? parseInt(env.ETH_CHAIN_ID) : 11155111;
/**
 * Network configurations for supported blockchains
 */
export const NETWORK_CONFIGS = {
    // Ethereum Mainnet
    1: {
        chainId: 1,
        name: 'Ethereum',
        rpcUrl: 'https://mainnet.infura.io/v3/' + env.INFURA_API_KEY,
        blockExplorerUrl: 'https://etherscan.io',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    // Sepolia Testnet
    11155111: {
        chainId: 11155111,
        name: 'Sepolia',
        rpcUrl: 'https://sepolia.infura.io/v3/' + env.INFURA_API_KEY,
        blockExplorerUrl: 'https://sepolia.etherscan.io',
        nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'ETH',
            decimals: 18
        }
    },
    // Polygon Mainnet
    137: {
        chainId: 137,
        name: 'Polygon',
        rpcUrl: 'https://polygon-mainnet.infura.io/v3/' + env.INFURA_API_KEY,
        blockExplorerUrl: 'https://polygonscan.com',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        }
    },
    // Mumbai Testnet
    80001: {
        chainId: 80001,
        name: 'Mumbai',
        rpcUrl: 'https://polygon-mumbai.infura.io/v3/' + env.INFURA_API_KEY,
        blockExplorerUrl: 'https://mumbai.polygonscan.com',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        }
    }
};
/**
 * Gets the network configuration for a specific chain ID
 * @param chainId The blockchain network ID
 * @returns The network configuration
 */
export function getNetworkConfig(chainId = DEFAULT_CHAIN_ID) {
    const config = NETWORK_CONFIGS[chainId];
    if (!config) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    return config;
}
//# sourceMappingURL=smartContract.config.js.map