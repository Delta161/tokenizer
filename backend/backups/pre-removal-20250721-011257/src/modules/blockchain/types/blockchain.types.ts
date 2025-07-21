import { Decimal } from '@prisma/client/runtime/library';
import { ethers } from 'ethers';

/**
 * Blockchain configuration
 */
export interface BlockchainConfig {
  chainId?: number;
  rpcUrl: string;
  privateKey?: string;
  gasLimit?: number;
  gasPrice?: string | number;
  artifactFileName?: string;
}

/**
 * Token metadata
 */
export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner?: string;
}

/**
 * DTO for minting tokens
 */
export interface MintTokensDTO {
  contractAddress: string;
  recipient: string;
  amount: Decimal;
}

/**
 * DTO for transferring tokens
 */
export interface TransferTokensDTO {
  contractAddress: string;
  recipient: string;
  amount: Decimal;
}

/**
 * DTO for checking balance
 */
export interface BalanceOfDTO {
  contractAddress: string;
  userWallet: string;
}

/**
 * Contract event listener
 */
export interface ContractEventListener {
  eventName: string;
  callback: (event: any) => void;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  transactionHash: string;
  blockNumber?: number;
  status?: boolean;
  events?: any[];
}

/**
 * Contract validation result
 */
export interface ContractValidationResult {
  isValid: boolean;
  isERC20: boolean;
  metadata?: TokenMetadata;
  error?: string;
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Transaction status
 */
export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

/**
 * Transaction receipt
 */
export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  status: TransactionStatus;
  gasUsed: string;
  events?: any[];
  error?: string;
}

/**
 * Blockchain response
 */
export interface BlockchainResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}