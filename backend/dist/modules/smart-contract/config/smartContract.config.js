import dotenv from 'dotenv';
dotenv.config();
/**
 * Default gas limit for transactions
 */
export const DEFAULT_GAS_LIMIT = process.env.GAS_LIMIT ? parseInt(process.env.GAS_LIMIT) : 3000000;
/**
 * Default gas price in wei
 */
export const DEFAULT_GAS_PRICE = process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) : 20000000000; // 20 gwei
/**
 * Private key for signing transactions
 */
export const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
/**
 * Contract owner address
 */
export const CONTRACT_OWNER_ADDRESS = process.env.CONTRACT_OWNER_ADDRESS || '';
/**
 * Path to contract artifacts
 */
export const CONTRACT_ARTIFACTS_PATH = process.env.CONTRACT_ARTIFACTS_PATH || 'contracts';
/**
 * Network configurations
 */
export const NETWORKS = {
    // Ethereum Mainnet
    '1': {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: process.env.MAINNET_RPC_URL || '',
        blockExplorerUrl: 'https://etherscan.io',
    },
    // Goerli Testnet
    '5': {
        chainId: 5,
        name: 'Goerli Testnet',
        rpcUrl: process.env.GOERLI_RPC_URL || '',
        blockExplorerUrl: 'https://goerli.etherscan.io',
    },
    // Sepolia Testnet
    '11155111': {
        chainId: 11155111,
        name: 'Sepolia Testnet',
        rpcUrl: process.env.SEPOLIA_RPC_URL || '',
        blockExplorerUrl: 'https://sepolia.etherscan.io',
    },
    // Hardhat Local
    '31337': {
        chainId: 31337,
        name: 'Hardhat Local',
        rpcUrl: 'http://127.0.0.1:8545',
        blockExplorerUrl: '',
    },
};
/**
 * Get network configuration by chain ID
 * @param chainId - Blockchain network ID
 * @returns Network configuration or undefined if not found
 */
export const getNetworkConfig = (chainId) => {
    const chainIdStr = chainId.toString();
    return NETWORKS[chainIdStr];
};
/**
 * Default chain ID to use if none specified
 */
export const DEFAULT_CHAIN_ID = 11155111; // Sepolia Testnet
//# sourceMappingURL=smartContract.config.js.map