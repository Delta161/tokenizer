import { UserRole, PropertyStatus } from '@prisma/client';
import { KycStatus } from '@modules/accounts/types/kyc.types';

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
export interface UserListQueryParams {
  role?: UserRole;
  email?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  limit?: number;
  offset?: number;
}

/**
 * Query parameters for listing properties
 */
export interface PropertyListQueryParams {
  status?: PropertyStatus;
  limit?: number;
  offset?: number;
}

/**
 * Query parameters for listing tokens
 */
export interface TokenListQueryParams {
  symbol?: string;
  chainId?: number;
  propertyId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Query parameters for listing KYC records
 */
export interface KycListQueryParams {
  status?: KycStatus;
  userId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Response for user list
 */
export interface UserListResponse {
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
  total: number;
}

/**
 * Response for property list
 */
export interface PropertyListResponse {
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
  total: number;
}

/**
 * Response for token list
 */
export interface TokenListResponse {
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
  total: number;
}

/**
 * Response for KYC record list
 */
export interface KycListResponse {
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
  total: number;
}

/**
 * Response for broadcast notification
 */
export interface BroadcastNotificationResponse {
  success: boolean;
  recipientCount: number;
}