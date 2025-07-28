// Token module types
import { TokenMetadata } from '../../blockchain/types/blockchain.types.js';

export interface TokenCreateDTO {
  propertyId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  contractAddress: string;
  blockchain?: string; // Optional, defaults to SEPOLIA
}

export interface TokenUpdateDTO {
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: string;
  contractAddress?: string;
  blockchain?: string;
  isActive?: boolean;
  isTransferable?: boolean;
}

export interface TokenPublicDTO {
  id: string;
  propertyId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  contractAddress: string;
  blockchain: string;
  isActive: boolean;
  isTransferable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenListQuery {
  propertyId?: string;
  symbol?: string;
  blockchain?: string;
  isActive?: boolean;
}

export interface TokenResponse {
  success: boolean;
  data?: TokenPublicDTO;
  error?: string;
  message?: string;
}

export interface TokenListResponse {
  success: boolean;
  data: TokenPublicDTO[];
  error?: string;
  message?: string;
}

export interface BlockchainBalanceQuery {
  contractAddress: string;
  walletAddress: string;
}

export interface BlockchainBalanceResponse {
  success: boolean;
  data?: { balance: string };
  error?: string;
  message?: string;
}

export interface BlockchainMetadataResponse {
  success: boolean;
  data?: TokenMetadata;
  error?: string;
  message?: string;
}

export interface TokenIdParams {
  id: string;
}

export interface ContractAddressParams {
  contractAddress: string;
}