import { ethers, isAddress } from 'ethers';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';

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
  // First try to find in contracts directory
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
  
  throw new Error(`Contract artifact ${artifactFileName} not found in contracts or artifacts directories`);
}

/**
 * Validates a transaction hash
 * @param txHash The transaction hash to validate
 * @returns boolean indicating if the hash is valid
 */
export function validateTxHash(txHash: string): boolean {
  return /^0x([A-Fa-f0-9]{64})$/.test(txHash);
}

/**
 * Formats an amount with the correct number of decimals for a token
 * @param amount The amount to format
 * @param decimals The number of decimals for the token
 * @returns The formatted amount as a string
 */
export function formatTokenAmount(amount: string | number, decimals: number): string {
  return ethers.parseUnits(amount.toString(), decimals).toString();
}

/**
 * Parses an amount from wei to a human-readable format
 * @param amount The amount in wei
 * @param decimals The number of decimals for the token
 * @returns The parsed amount as a string
 */
export function parseTokenAmount(amount: string | bigint, decimals: number): string {
  return ethers.formatUnits(amount, decimals);
}

/**
 * Zod schema for validating Ethereum addresses
 */
export const EthereumAddressSchema = z.string().refine(validateAddress, {
  message: 'Invalid Ethereum address',
});

/**
 * Zod schema for validating transaction hashes
 */
export const TransactionHashSchema = z.string().refine(validateTxHash, {
  message: 'Invalid transaction hash',
});