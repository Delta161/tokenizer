import { KycRecord } from '@prisma/client';

/**
 * KYC status enum
 */
export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
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