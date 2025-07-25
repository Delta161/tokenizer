/**
 * Projects Module Types
 * 
 * This file consolidates and exports all types from the client, property, and token modules
 * that have been merged into the projects module.
 */

import { ClientStatus, PropertyStatus } from '@prisma/client';
import { TokenMetadata } from '../../blockchain/types/blockchain.types.js';

// ===== CLIENT TYPES =====

/**
 * Client application request DTO
 * Used when a user applies to become a client
 */
export interface ClientApplicationDTO {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  legalEntityNumber?: string;
  walletAddress?: string;
}

/**
 * Client update request DTO
 * Used when a client updates their profile
 */
export interface ClientUpdateDTO {
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  country?: string;
  legalEntityNumber?: string;
  walletAddress?: string;
  logoUrl?: string;
}

/**
 * Client status update DTO
 * Used by admins to update client status
 */
export interface ClientStatusUpdateDTO {
  status: ClientStatus;
}

/**
 * Public client profile DTO
 * Safe for external consumption, excludes sensitive data
 */
export interface ClientPublicDTO {
  id: string;
  userId: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  legalEntityNumber?: string;
  walletAddress?: string;
  status: ClientStatus;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Client profile response wrapper
 */
export interface ClientProfileResponse {
  success: true;
  data: ClientPublicDTO;
}

/**
 * Client list response wrapper
 */
export interface ClientListResponse {
  success: boolean;
  data: ClientPublicDTO[];
  meta?: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  };
}

/**
 * Client application response wrapper
 */
export interface ClientApplicationResponse {
  success: true;
  data: ClientPublicDTO;
  message: string;
}

/**
 * Client update response wrapper
 */
export interface ClientUpdateResponse {
  success: true;
  data: ClientPublicDTO;
  message: string;
}

/**
 * Client status update response wrapper
 */
export interface ClientStatusUpdateResponse {
  success: true;
  data: ClientPublicDTO;
  message: string;
}

/**
 * Request parameter validation types
 */
export interface ClientIdParams {
  id: string;
}

/**
 * Query parameters for client listing
 */
export interface ClientListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: ClientStatus;
}

// ===== PROPERTY TYPES =====

/**
 * Property Data Transfer Object
 * Used for returning property data to clients
 */
export interface PropertyDTO {
  id: string;
  clientId: string;
  title: string;
  description: string;
  country: string;
  city: string;
  address: string;
  imageUrls: string[];
  totalPrice: string;
  tokenPrice: string;
  irr: string;
  apr: string;
  valueGrowth: string;
  minInvestment: string;
  tokensAvailablePercent: string;
  tokenSymbol: string;
  status: PropertyStatus;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Property Data Transfer Object
 * Used for creating a new property
 */
export interface CreatePropertyDTO {
  title: string;
  description: string;
  country: string;
  city: string;
  address: string;
  imageUrls: string[];
  totalPrice: string;
  tokenPrice: string;
  irr: string;
  apr: string;
  valueGrowth: string;
  minInvestment: string;
  tokensAvailablePercent: string;
  tokenSymbol: string;
}

/**
 * Update Property Data Transfer Object
 * Used for updating an existing property
 */
export interface UpdatePropertyDTO {
  title?: string;
  description?: string;
  country?: string;
  city?: string;
  address?: string;
  imageUrls?: string[];
  totalPrice?: string;
  tokenPrice?: string;
  irr?: string;
  apr?: string;
  valueGrowth?: string;
  minInvestment?: string;
  tokensAvailablePercent?: string;
}

/**
 * Update Property Status Data Transfer Object
 * Used for updating a property's status
 */
export interface UpdatePropertyStatusDTO {
  status: PropertyStatus;
}

/**
 * Property Filter Options
 * Used for filtering properties in list operations
 */
export interface PropertyFilterOptions {
  status?: PropertyStatus;
  clientId?: string;
}

/**
 * Property Sort Options
 * Used for sorting properties in list operations
 */
export interface PropertySortOptions {
  field: 'createdAt' | 'updatedAt' | 'title' | 'tokenPrice';
  direction: 'asc' | 'desc';
}

/**
 * Property Pagination Options
 * Used for paginating property lists
 */
export interface PropertyPaginationOptions {
  page?: number;
  limit?: number;
}

// ===== TOKEN TYPES =====

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

// ===== COMMON TYPES =====

/**
 * Generic error response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

/**
 * Project response interfaces
 * These interfaces combine client, property, and token data
 */
export interface ProjectDTO {
  property: PropertyDTO;
  client: ClientPublicDTO;
  token?: TokenPublicDTO;
}

export interface ProjectListResponse {
  success: boolean;
  data: ProjectDTO[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  };
  error?: string;
  message?: string;
}

export interface ProjectResponse {
  success: boolean;
  data?: ProjectDTO;
  error?: string;
  message?: string;
}

/**
 * Project filter options
 * Used for filtering projects in list operations
 */
export interface ProjectFilterOptions extends PropertyFilterOptions {
  clientStatus?: ClientStatus;
  hasToken?: boolean;
}