import { ethers, isAddress } from 'ethers';
import path from 'path';
import fs from 'fs';
/**
 * Validates an Ethereum address
 * @param address The address to validate
 * @returns boolean indicating if the address is valid
 */
export function validateAddress(address) {
    return isAddress(address);
}
/**
 * Loads a contract ABI from a JSON file
 * @param artifactPath Path to the contract artifact JSON file
 * @returns The contract ABI
 */
export function loadContractABI(artifactPath) {
    if (!fs.existsSync(artifactPath)) {
        throw new Error(`Contract artifact not found at ${artifactPath}`);
    }
    try {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        return artifact.abi;
    }
    catch (error) {
        throw new Error(`Failed to parse contract artifact: ${error}`);
    }
}
/**
 * Resolves the path to a contract artifact
 * @param artifactFileName The name of the artifact file
 * @returns The full path to the artifact file
 */
export function resolveArtifactPath(artifactFileName) {
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
    throw new Error(`Contract artifact ${artifactFileName} not found`);
}
/**
 * Validates a transaction hash
 * @param txHash The transaction hash to validate
 * @returns boolean indicating if the hash is valid
 */
export function validateTxHash(txHash) {
    // Transaction hash should be a 0x-prefixed 32-byte hex string
    return /^0x([A-Fa-f0-9]{64})$/.test(txHash);
}
/**
 * Formats an amount with the specified number of decimals
 * @param amount The amount to format
 * @param decimals The number of decimals
 * @returns The formatted amount as a string
 */
export function formatAmount(amount, decimals) {
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
export function parseAmount(amount, decimals) {
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
export function getShortAddress(address) {
    if (!validateAddress(address)) {
        throw new Error('Invalid Ethereum address');
    }
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
//# sourceMappingURL=smartContract.utils.js.map