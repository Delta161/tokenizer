import { z } from 'zod';
import { validateAddress, validateTxHash } from '../utils/contract.utils.js';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Schema for validating contract address
 */
export const ContractAddressSchema = z.object({
  contractAddress: z.string().refine(validateAddress, {
    message: 'Invalid Ethereum contract address',
  }),
});

/**
 * Schema for validating wallet address
 */
export const WalletAddressSchema = z.object({
  walletAddress: z.string().refine(validateAddress, {
    message: 'Invalid Ethereum wallet address',
  }),
});

/**
 * Schema for validating token balance query
 */
export const BalanceQuerySchema = z.object({
  contractAddress: z.string().refine(validateAddress, {
    message: 'Invalid Ethereum contract address',
  }),
  userWallet: z.string().refine(validateAddress, {
    message: 'Invalid Ethereum wallet address',
  }),
});

/**
 * Schema for validating token amount
 */
export const TokenAmountSchema = z.object({
  amount: z.string().or(z.number()).transform(val => new Decimal(val.toString())),
});

/**
 * Schema for validating mint tokens request
 */
export const MintTokensSchema = z.object({
  contractAddress: z.string().refine(validateAddress, {
    message: 'Invalid Ethereum contract address',
  }),
  recipient: z.string().refine(validateAddress, {
    message: 'Invalid recipient address',
  }),
  amount: z.string().or(z.number()).transform(val => new Decimal(val.toString())),
});

/**
 * Schema for validating transfer tokens request
 */
export const TransferTokensSchema = z.object({
  contractAddress: z.string().refine(validateAddress, {
    message: 'Invalid Ethereum contract address',
  }),
  recipient: z.string().refine(validateAddress, {
    message: 'Invalid recipient address',
  }),
  amount: z.string().or(z.number()).transform(val => new Decimal(val.toString())),
});

/**
 * Schema for validating transaction hash
 */
export const TransactionHashSchema = z.object({
  txHash: z.string().refine(validateTxHash, {
    message: 'Invalid transaction hash',
  }),
});

/**
 * Schema for validating network configuration
 */
export const NetworkConfigSchema = z.object({
  chainId: z.number(),
  rpcUrl: z.string().url(),
  name: z.string(),
  blockExplorerUrl: z.string().url().optional(),
  nativeCurrency: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
  }).optional(),
});