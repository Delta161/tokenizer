import { Decimal } from '@prisma/client/runtime/library';

export interface TokenCreateDTO {
  propertyId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string | Decimal;
  contractAddress: string;
  chainId: string;
}

export interface TokenUpdateDTO {
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: string | Decimal;
  contractAddress?: string;
  chainId?: string;
}

export interface TokenPublicDTO {
  id: string;
  propertyId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  contractAddress: string;
  chainId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenListQuery {
  propertyId?: string;
  symbol?: string;
  chainId?: string;
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