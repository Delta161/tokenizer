import { ethers, isAddress } from 'ethers';
import path from 'path';
import fs from 'fs';
import { DeploymentConfig } from '../types/blockchain.types.js';

/**
 * Validates an Ethereum address
 * @param address The address to validate
 * @returns boolean indicating if the address is valid
 */
export function validateAddress(address: string): boolean {
  return isAddress(address);
}

/**
 * Loads a contract ABI from a JSON file
 * @param artifactPath Path to the contract artifact JSON file
 * @returns The contract ABI
 */
export function loadContractABI(artifactPath: string): any {
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Contract artifact not found at ${artifactPath}`);
  }
  try {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    return artifact.abi;
  } catch (error) {
    throw new Error(`Failed to parse contract artifact: ${error}`);
  }
}

/**
 * Resolves the path to a contract artifact
 * @param artifactFileName The name of the artifact file
 * @returns The full path to the artifact file
 */
export function resolveArtifactPath(artifactFileName: string): string {
  // First try to find in blockchain module artifacts directory
  const moduleArtifactsPath = path.resolve(process.cwd(), 'src/modules/blockchain/artifacts');
  const moduleArtifactPath = path.resolve(moduleArtifactsPath, artifactFileName);
  
  if (fs.existsSync(moduleArtifactPath)) {
    return moduleArtifactPath;
  }
  
  // For backward compatibility, try to find in contracts directory
  const contractsPath = path.resolve(process.cwd(), 'contracts');
  const artifactPath = path.resolve(contractsPath, artifactFileName);
  
  if (fs.existsSync(artifactPath)) {
    return artifactPath;
  }
  
  // Then try to find in hardhat artifacts directory
  const hardhatPath = path.resolve(process.cwd(), 'artifacts/contracts');
  const hardhatArtifactPath = path.resolve(hardhatPath, artifactFileName);
  
  if (fs.existsSync(hardhatArtifactPath)) {
    return hardhatArtifactPath;
  }
  
  throw new Error(`Contract artifact ${artifactFileName} not found`);
}

/**
 * Validates a transaction hash
 * @param txHash The transaction hash to validate
 * @returns boolean indicating if the hash is valid
 */
export function validateTxHash(txHash: string): boolean {
  // Transaction hash should be a 0x-prefixed 32-byte hex string
  return /^0x([A-Fa-f0-9]{64})$/.test(txHash);
}

/**
 * Formats an amount with the specified number of decimals
 * @param amount The amount to format
 * @param decimals The number of decimals
 * @returns The formatted amount as a string
 */
export function formatAmount(amount: string | number, decimals: number): string {
  const amountBN = ethers.parseUnits(amount.toString(), decimals);
  return amountBN.toString();
}

/**
 * Alias for formatAmount for backward compatibility
 */
export const formatTokenAmount = formatAmount;

/**
 * Parses an amount from the specified number of decimals to a human-readable format
 * @param amount The amount to parse
 * @param decimals The number of decimals
 * @returns The parsed amount as a string
 */
export function parseAmount(amount: string | number, decimals: number): string {
  return ethers.formatUnits(amount.toString(), decimals);
}

/**
 * Alias for parseAmount for backward compatibility
 */
export const parseTokenAmount = parseAmount;

/**
 * Gets the short address format (e.g., 0x1234...5678)
 * @param address The full Ethereum address
 * @returns The shortened address
 */
export function getShortAddress(address: string): string {
  if (!validateAddress(address)) {
    throw new Error('Invalid Ethereum address');
  }
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Load deployment configuration from deployments.json
 * @returns Deployment configuration object
 */
export function loadDeploymentConfig(): DeploymentConfig {
  try {
    // First try to find in blockchain module artifacts directory
    const moduleDeploymentsPath = path.resolve(process.cwd(), 'src/modules/blockchain/artifacts', 'deployments.json');
    
    // For backward compatibility, check the old location if not found in the module
    const legacyDeploymentsPath = path.resolve(process.cwd(), 'contracts', 'deployments.json');
    
    // Determine which path to use
    const deploymentsPath = fs.existsSync(moduleDeploymentsPath) 
      ? moduleDeploymentsPath 
      : fs.existsSync(legacyDeploymentsPath) 
        ? legacyDeploymentsPath 
        : null;
    
    if (!deploymentsPath) {
      console.warn('deployments.json not found, using empty configuration');
      return { networks: {} };
    }
    
    const deploymentsContent = fs.readFileSync(deploymentsPath, 'utf8');
    const deploymentConfig: DeploymentConfig = JSON.parse(deploymentsContent);
    
    return deploymentConfig;
  } catch (error) {
    console.error('Error loading deployment configuration:', error);
    return { networks: {} };
  }
}