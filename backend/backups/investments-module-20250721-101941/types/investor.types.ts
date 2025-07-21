import { Blockchain } from '@prisma/client';

/**
 * Investor application request DTO
 * Used when a user applies to become an investor
 */
export interface InvestorApplicationDTO {
  nationality: string;
  dateOfBirth?: Date;
  institutionName?: string;
  vatNumber?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country: string;
  postalCode?: string;
}

/**
 * Investor update request DTO
 * Used when an investor updates their profile
 */
export interface InvestorUpdateDTO {
  nationality?: string;
  dateOfBirth?: Date;
  institutionName?: string;
  vatNumber?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

/**
 * Investor verification status update DTO
 * Used by admins to update investor verification status
 */
export interface InvestorVerificationUpdateDTO {
  isVerified: boolean;
  verificationMethod?: string;
}

/**
 * Wallet creation DTO
 * Used when an investor adds a new wallet
 */
export interface WalletCreateDTO {
  address: string;
  blockchain: Blockchain;
}

/**
 * Wallet verification update DTO
 * Used to update wallet verification status
 */
export interface WalletVerificationUpdateDTO {
  isVerified: boolean;
}

/**
 * Public wallet DTO
 * Safe for external consumption
 */
export interface WalletPublicDTO {
  id: string;
  investorId: string;
  address: string;
  blockchain: Blockchain;
  isVerified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Public investor profile DTO
 * Safe for external consumption, excludes sensitive data
 */
export interface InvestorPublicDTO {
  id: string;
  userId: string;
  nationality: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verificationMethod?: string;
  dateOfBirth?: Date;
  institutionName?: string;
  vatNumber?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country: string;
  postalCode?: string;
  createdAt: Date;
  updatedAt: Date;
  wallets: WalletPublicDTO[];
}

/**
 * Investor profile response wrapper
 */
export interface InvestorProfileResponse {
  success: true;
  data: InvestorPublicDTO;
}

/**
 * Investor list response wrapper
 */
export interface InvestorListResponse {
  success: true;
  data: InvestorPublicDTO[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Investor application response wrapper
 */
export interface InvestorApplicationResponse {
  success: true;
  data: InvestorPublicDTO;
  message: string;
}

/**
 * Investor update response wrapper
 */
export interface InvestorUpdateResponse {
  success: true;
  data: InvestorPublicDTO;
  message: string;
}

/**
 * Investor verification update response wrapper
 */
export interface InvestorVerificationUpdateResponse {
  success: true;
  data: InvestorPublicDTO;
  message: string;
}

/**
 * Wallet creation response wrapper
 */
export interface WalletCreateResponse {
  success: true;
  data: WalletPublicDTO;
  message: string;
}

/**
 * Wallet verification update response wrapper
 */
export interface WalletVerificationUpdateResponse {
  success: true;
  data: WalletPublicDTO;
  message: string;
}

/**
 * Generic error response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

/**
 * Request parameter validation types
 */
export interface InvestorIdParams {
  id: string;
}

export interface WalletIdParams {
  walletId: string;
}

/**
 * Query parameters for investor listing
 */
export interface InvestorListQuery {
  limit?: number;
  offset?: number;
  isVerified?: boolean;
  country?: string;
}