import { ClientStatus } from '@prisma/client';

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
  success: true;
  data: ClientPublicDTO[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
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