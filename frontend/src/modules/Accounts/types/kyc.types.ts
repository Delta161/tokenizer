/**
 * KYC Types
 * 
 * This file defines the types used for KYC (Know Your Customer) functionality in the Accounts module.
 * Updated to match backend KYC types structure.
 */

import type { User } from './user.types';

/**
 * KYC Status enum - matches backend KycStatus
 */
export enum KycStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

/**
 * KYC Provider enum - matches backend KycProvider
 */
export enum KycProvider {
  SUMSUB = 'sumsub',
  ONFIDO = 'onfido',
  VERIFF = 'veriff'
}

/**
 * KYC Record interface - matches backend KycRecordDTO
 */
export interface KycRecord {
  id: string;
  userId: string;
  status: KycStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  documentsUploaded: boolean;
  personalInfoComplete: boolean;
  addressVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * KYC Submission Data - matches backend KycSubmissionData
 */
export interface KycSubmissionData {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    nationality?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  documentType?: string;
  [key: string]: any; // Allow for flexible data structure
}

/**
 * KYC Update Data - matches backend KycUpdateData
 */
export interface KycUpdateData {
  status: KycStatus;
  rejectionReason?: string;
}

/**
 * KYC Provider Session - matches backend KycProviderSession
 */
export interface KycProviderSession {
  redirectUrl: string;
  expiresAt: string;
  referenceId: string;
}

/**
 * KYC Record with User - matches backend KycRecordWithUser
 */
export interface KycRecordWithUser extends KycRecord {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

/**
 * KYC API Response - matches backend KycResponse
 */
export interface KycResponse {
  success: boolean;
  data?: KycRecord | { status: string };
  error?: string;
}

/**
 * KYC List Response - matches backend KycListResponse
 */
export interface KycListResponse {
  success: boolean;
  data?: KycRecordWithUser[];
  error?: string;
}