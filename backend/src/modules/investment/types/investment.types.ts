import { InvestmentStatus as PrismaInvestmentStatus, PaymentMethod as PrismaPaymentMethod } from '@prisma/client';

/**
 * Investment status type from Prisma schema
 */
export type InvestmentStatus = PrismaInvestmentStatus;

/**
 * Payment method type from Prisma schema
 */
export type PaymentMethod = PrismaPaymentMethod;

/**
 * Data transfer object for creating an investment
 */
export interface InvestmentCreateDTO {
  tokenId: string;
  propertyId: string;
  amount: string; // Total investment amount
  tokensBought: string; // Price per token
  walletAddress: string;
  paymentMethod?: PaymentMethod;
  currency?: string;
}

/**
 * Data transfer object for updating an investment status
 */
export interface InvestmentUpdateStatusDTO {
  status: InvestmentStatus;
  txHash?: string;
}

/**
 * Public data transfer object for investment
 */
export interface InvestmentPublicDTO {
  id: string;
  investorId: string;
  tokenId: string;
  propertyId: string;
  amount: string;
  tokensBought: string;
  status: InvestmentStatus;
  txHash?: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Sorting parameters
 */
export interface SortingParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query parameters for investment list
 */
export interface InvestmentListQuery extends PaginationParams, SortingParams {
  investorId?: string;
  tokenId?: string;
  propertyId?: string;
  status?: InvestmentStatus;
}

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Response for a single investment
 */
export interface InvestmentResponse {
  success: boolean;
  data?: InvestmentPublicDTO;
  error?: string;
  message?: string;
}

/**
 * Response for a list of investments with pagination
 */
export interface InvestmentListResponse {
  success: boolean;
  data: InvestmentPublicDTO[];
  meta: PaginationMeta;
  error?: string;
  message?: string;
}