/**
 * KYC Types
 * 
 * This file defines the types used for KYC (Know Your Customer) functionality in the Accounts module.
 */

/**
 * KYC Status enum
 */
export enum KycStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

/**
 * KYC Provider enum
 */
export enum KycProvider {
  SUMSUB = 'sumsub',
  MANUAL = 'manual'
}

/**
 * KYC Record interface
 */
export interface KycRecord {
  id: string;
  userId: string;
  status: KycStatus;
  provider?: KycProvider;
  documentType?: string;
  country?: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  referenceId?: string;
}

/**
 * KYC Submission Data
 */
export interface KycSubmissionData {
  documentType: string;
  country: string;
}

/**
 * KYC Provider Session
 */
export interface KycProviderSession {
  redirectUrl: string;
  expiresAt: Date | string;
  referenceId: string;
}