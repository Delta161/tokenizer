/**
 * Contract Utilities
 * Helper functions for blockchain contract interactions
 */

import { isAddress } from 'ethers';
import fs from 'fs';
import path from 'path';

/**
 * Validates an Ethereum address
 * @param address The address to validate
 * @returns True if the address is valid
 */
export function validateAddress(address: string): boolean {
  return isAddress(address);
}

/**
 * Validates a transaction hash
 * @param txHash The transaction hash to validate
 * @returns True if the hash is valid
 */
export function validateTxHash(txHash: string): boolean {
  // Basic validation for Ethereum transaction hash
  return /^0x([A-Fa-f0-9]{64})$/.test(txHash);
}

/**
 * Formats a token amount with the correct number of decimals
 * @param amount The amount to format
 * @param decimals The number of decimals
 * @returns The formatted amount
 */
export function formatTokenAmount(amount: string | number, decimals: number): string {
  const amountStr = amount.toString();
  const amountBigInt = BigInt(amountStr);
  const divisor = BigInt(10) ** BigInt(decimals);
  const integerPart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;
  
  // Format the fractional part with leading zeros
  let fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  
  // Remove trailing zeros
  fractionalStr = fractionalStr.replace(/0+$/, '');
  
  return fractionalStr ? `${integerPart}.${fractionalStr}` : integerPart.toString();
}

/**
 * Loads a contract ABI from a JSON file
 * @param filePath Path to the contract artifact JSON file
 * @returns The contract ABI
 */
export function loadContractABI(filePath: string): any[] {
  try {
    const artifact = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return artifact.abi;
  } catch (error: any) {
    throw new Error(`Failed to load contract ABI: ${error.message}`);
  }
}

/**
 * Resolves the path to a contract artifact file
 * @param fileName The name of the artifact file
 * @returns The resolved path
 */
export function resolveArtifactPath(fileName: string): string {
  // Try to find the artifact in the contracts directory
  const contractsDir = path.resolve(process.cwd(), 'contracts');
  const filePath = path.join(contractsDir, fileName);
  
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  
  // If not found, try one level up (for monorepo structures)
  const parentContractsDir = path.resolve(process.cwd(), '..', 'contracts');
  const parentFilePath = path.join(parentContractsDir, fileName);
  
  if (fs.existsSync(parentFilePath)) {
    return parentFilePath;
  }
  
  throw new Error(`Contract artifact not found: ${fileName}`);
}