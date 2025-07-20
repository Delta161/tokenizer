import { KycRecord } from '@prisma/client';
/**
 * KYC status enum
 */
export declare enum KycStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
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
    data?: KycRecord | {
        status: string;
    };
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
//# sourceMappingURL=kyc.types.d.ts.map