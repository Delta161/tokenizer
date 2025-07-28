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
 * Client profile response
 * Used for API responses when returning a single client
 */
export interface ClientProfileResponse {
  success: boolean;
  data: ClientPublicDTO;
}

/**
 * Client list response
 * Used for API responses when returning a list of clients
 */
export interface ClientListResponse {
  success: boolean;
  data: ClientPublicDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Client application response
 * Used for API responses when creating a client
 */
export interface ClientApplicationResponse {
  success: boolean;
  data: ClientPublicDTO;
}

/**
 * Client update response
 * Used for API responses when updating a client
 */
export interface ClientUpdateResponse {
  success: boolean;
  data: ClientPublicDTO;
}

/**
 * Client status update response
 * Used for API responses when updating a client status
 */
export interface ClientStatusUpdateResponse {
  success: boolean;
  data: ClientPublicDTO;
}

/**
 * Error response
 * Used for API error responses
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: any;
}

/**
 * Client ID parameters
 * Used for route parameters that include a client ID
 */
export interface ClientIdParams {
  id: string;
}

/**
 * Client list query parameters
 * Used for filtering and pagination in list endpoints
 */
export interface ClientListQuery {
  page?: number;
  limit?: number;
  status?: ClientStatus;
  search?: string;
}