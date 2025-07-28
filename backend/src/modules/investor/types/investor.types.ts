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
 * Investor profile response
 * Used for API responses when returning a single investor profile
 */
export interface InvestorProfileResponse {
  success: boolean;
  data: InvestorPublicDTO;
  message?: string;
}

/**
 * Investor list response
 * Used for API responses when returning a list of investor profiles
 */
export interface InvestorListResponse {
  success: boolean;
  data: InvestorPublicDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Investor application response
 * Used for API responses when creating an investor profile
 */
export interface InvestorApplicationResponse {
  success: boolean;
  data: InvestorPublicDTO;
  message: string;
}

/**
 * Investor update response
 * Used for API responses when updating an investor profile
 */
export interface InvestorUpdateResponse {
  success: boolean;
  data: InvestorPublicDTO;
  message: string;
}

/**
 * Investor verification update response
 * Used for API responses when updating investor verification status
 */
export interface InvestorVerificationUpdateResponse {
  success: boolean;
  data: InvestorPublicDTO;
  message: string;
}

/**
 * Wallet create response
 * Used for API responses when creating a wallet
 */
export interface WalletCreateResponse {
  success: boolean;
  data: WalletPublicDTO;
  message: string;
}

/**
 * Wallet verification update response
 * Used for API responses when updating wallet verification status
 */
export interface WalletVerificationUpdateResponse {
  success: boolean;
  data: WalletPublicDTO;
  message: string;
}

/**
 * Investor ID path parameters
 * Used for API routes that require an investor ID
 */
export interface InvestorIdParams {
  id: string;
}

/**
 * Wallet ID path parameters
 * Used for API routes that require a wallet ID
 */
export interface WalletIdParams {
  walletId: string;
}

/**
 * Investor list query parameters
 * Used for filtering and pagination of investor lists
 */
export interface InvestorListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isVerified?: boolean;
  country?: string;
}