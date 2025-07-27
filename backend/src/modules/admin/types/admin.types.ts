import { UserRole, PropertyStatus } from '@prisma/client';
import { KycStatus } from '../../accounts/types/kyc.types.js';

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
 * DTO for sending a broadcast notification
 */
export interface BroadcastNotificationDto {
  title: string;
  message: string;
  userRole?: UserRole | null;
}

/**
 * User response DTO
 */
export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  kyc?: {
    status: KycStatus;
    updatedAt: Date;
  } | null;
}

/**
 * Property response DTO
 */
export interface PropertyResponseDto {
  id: string;
  title: string;
  status: PropertyStatus;
  moderationComment?: string | null;
  moderatedAt?: Date | null;
  updatedAt: Date;
}

/**
 * Date range query parameters
 */
export interface DateRangeParams {
  startDate: Date;
  endDate: Date;
  interval?: 'day' | 'week' | 'month';
}

/**
 * Property submission query parameters
 */
export interface PropertySubmissionParams extends DateRangeParams {
  status?: PropertyStatus;
}

/**
 * Platform summary response
 */
export interface PlatformSummaryResponse {
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  properties: {
    total: number;
    byStatus: Record<string, number>;
  };
  tokens: {
    total: number;
  };
  investments: {
    count: number;
    totalAmount: number;
  };
  kyc: {
    total: number;
    byStatus: Record<string, number>;
  };
}

/**
 * User registration trend response
 */
export interface RegistrationTrendResponse {
  date: string;
  count: number;
}

/**
 * Property submission trend response
 */
export interface SubmissionTrendResponse {
  status: PropertyStatus;
  count: number;
}

/**
 * Visit summary response
 */
export interface VisitSummaryResponse {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

/**
 * KYC status distribution response
 */
export interface KycDistributionResponse {
  total: number;
  withKyc: number;
  withoutKyc: number;
  byStatus: Record<string, number>;
  percentages?: {
    withKyc: number;
    withoutKyc: number;
    byStatus: Record<string, number>;
  };
}