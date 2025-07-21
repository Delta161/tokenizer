// External packages
import type { KycRecord, User } from '@prisma/client';

/**
 * KYC status enum
 */
export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

/**
 * KYC Record DTO interface
 */
export interface KycRecordDTO {
  id: string;
  userId: string;
  status: KycStatus;
  documentType: string;
  country: string;
  provider?: string;
  providerReference?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  verifiedAt?: Date;
}

/**
 * KYC provider enum
 */
export enum KycProvider {
  SUMSUB = 'sumsub',
  ONFIDO = 'onfido',
  VERIFF = 'veriff'
}

/**
 * KYC provider session interface
 */
export interface KycProviderSession {
  redirectUrl: string;
  expiresAt: Date;
  referenceId: string;
}

/**
 * KYC submission data interface
 */
export interface KycSubmissionData {
  documentType: string;
  country: string;
}

/**
 * KYC update data interface for admin
 */
export interface KycUpdateData {
  status: KycStatus;
  rejectionReason?: string;
}

/**
 * KYC record with user information
 */
export interface KycRecordWithUser extends KycRecord {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

/**
 * Response for KYC record
 */
export interface KycResponse {
  success: boolean;
  data?: KycRecord | { status: string };
  error?: string;
}

/**
 * Response for KYC records list
 */
export interface KycListResponse {
  success: boolean;
  data?: KycRecordWithUser[];
  error?: string;
}
