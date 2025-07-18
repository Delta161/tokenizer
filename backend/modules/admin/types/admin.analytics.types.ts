import { UserRole, PropertyStatus } from '@prisma/client';

/**
 * Response DTO for platform summary endpoint
 */
export interface SummaryResponse {
  users: {
    total: number;
    byRole: Record<UserRole, number>;
  };
  properties: {
    total: number;
    byStatus: Record<PropertyStatus, number>;
  };
  tokens: {
    total: number;
  };
  investments: {
    total: number;
  };
}

/**
 * Response DTO for user registrations trend endpoint
 */
export interface RegistrationsTrendDto {
  daily: Array<{ date: string; count: number }>;
  total: number;
}

/**
 * Response DTO for property submissions trend endpoint
 */
export interface PropertySubmissionDto {
  daily: Array<{ date: string; count: number }>;
  total: number;
}

/**
 * Response DTO for visit summary endpoint
 */
export interface VisitSummaryDto {
  totalVisits: number;
  topProperties: Array<{
    propertyId: string;
    title: string;
    visitCount: number;
  }>;
  recentTrend: Array<{ date: string; count: number }>;
}

/**
 * Response DTO for KYC status distribution endpoint
 */
export interface KycDistributionDto {
  total: number;
  byStatus: Record<string, number>;
}

/**
 * Query parameters for date range filtering
 */
export interface DateRangeQuery {
  from?: string;
  to?: string;
  status?: PropertyStatus;
}