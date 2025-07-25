import { UserRole, PropertyStatus } from '@prisma/client';
import { KycStatus } from '@modules/accounts/types/kyc.types';

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
 * Paginated response metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * DTO for updating a user's role
 */
export interface UpdateUserRoleDto {
  role: UserRole;
}

/**
 * DTO for updating a user's active status
 */
export interface UpdateUserStatusDto {
  isActive: boolean;
}

/**
 * DTO for moderating a property
 */
export interface ModeratePropertyDto {
  status: PropertyStatus.APPROVED | PropertyStatus.REJECTED;
  comment: string;
}

/**
 * DTO for sending admin notifications
 */
export interface AdminNotificationDto {
  title: string;
  message: string;
  targetRoles: UserRole[];
}

/**
 * Query parameters for listing users
 */
export interface UserListQueryParams extends PaginationParams, SortingParams {
  role?: UserRole;
  email?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;
}

/**
 * Query parameters for listing properties
 */
export interface PropertyListQueryParams extends PaginationParams, SortingParams {
  status?: PropertyStatus;
}

/**
 * Query parameters for listing tokens
 */
export interface TokenListQueryParams extends PaginationParams, SortingParams {
  symbol?: string;
  chainId?: number;
  propertyId?: string;
}

/**
 * Query parameters for listing KYC records
 */
export interface KycListQueryParams extends PaginationParams, SortingParams {
  status?: KycStatus;
  userId?: string;
}

/**
 * Response for user list
 */
export interface UserListResponse {
  success: boolean;
  users: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  meta: PaginationMeta;
  error?: string;
  message?: string;
}

/**
 * Response for property list
 */
export interface PropertyListResponse {
  success: boolean;
  properties: Array<{
    id: string;
    title: string;
    description: string;
    status: PropertyStatus;
    address: any;
    price: number;
    createdAt: Date;
    updatedAt: Date;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  meta: PaginationMeta;
  error?: string;
  message?: string;
}

/**
 * Response for token list
 */
export interface TokenListResponse {
  success: boolean;
  tokens: Array<{
    id: string;
    symbol: string;
    name: string;
    contractAddress: string;
    chainId: number;
    totalSupply: string;
    createdAt: Date;
    property: {
      id: string;
      title: string;
    };
  }>;
  meta: PaginationMeta;
  error?: string;
  message?: string;
}

/**
 * Response for KYC record list
 */
export interface KycListResponse {
  success: boolean;
  kycRecords: Array<{
    id: string;
    status: KycStatus;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  meta: PaginationMeta;
  error?: string;
  message?: string;
}

/**
 * Response for broadcast notification
 */
export interface BroadcastNotificationResponse {
  success: boolean;
  recipientCount: number;
}