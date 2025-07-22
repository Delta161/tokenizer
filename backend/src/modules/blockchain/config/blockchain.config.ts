import dotenv from 'dotenv';
import { NetworkConfig } from '../types/blockchain.types.js';
import { loadDeploymentConfig } from '../utils/blockchain.utils.js';

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
export const CONTRACT_ARTIFACTS_PATH = process.env.CONTRACT_ARTIFACTS_PATH || 'src/modules/blockchain/artifacts';

/**
 * Default chain ID
 */
export const DEFAULT_CHAIN_ID = process.env.DEFAULT_CHAIN_ID ? parseInt(process.env.DEFAULT_CHAIN_ID) : 1;

/**
 * Load deployment configuration and merge with network configs
 */
const deploymentConfig = loadDeploymentConfig();

/**
 * Network configurations with contract addresses
 */
export const NETWORKS: Record<string, NetworkConfig> = {
  // Ethereum Mainnet
  '1': {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.MAINNET_RPC_URL || '',
    blockExplorerUrl: 'https://etherscan.io',
    contracts: deploymentConfig.networks['1']?.contracts || {},
  },
  // Goerli Testnet
  '5': {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: process.env.GOERLI_RPC_URL || '',
    blockExplorerUrl: 'https://goerli.etherscan.io',
    contracts: deploymentConfig.networks['5']?.contracts || {},
  },
  // Sepolia Testnet
  '11155111': {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: process.env.SEPOLIA_RPC_URL || '',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    contracts: deploymentConfig.networks['11155111']?.contracts || {},
  },
  // Hardhat Local
  '31337': {
    chainId: 31337,
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorerUrl: 'http://localhost:8545',
    contracts: deploymentConfig.networks['31337']?.contracts || {},
  },
  // Polygon Mainnet
  '137': {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: process.env.POLYGON_RPC_URL || '',
    blockExplorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    contracts: {},
  },
  // Polygon Mumbai Testnet
  '80001': {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: process.env.MUMBAI_RPC_URL || '',
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    contracts: {},
  },
};

/**
 * Get network configuration by chain ID
 * @param chainId The chain ID
 * @returns The network configuration
 */
export function getNetworkConfig(chainId: number): NetworkConfig {
  const chainIdStr = chainId.toString();
  if (!NETWORKS[chainIdStr]) {
    throw new Error(`Network configuration not found for chain ID ${chainId}`);
  }
  return NETWORKS[chainIdStr];
}