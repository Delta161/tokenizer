/**
 * KYC Mapper
 * 
 * This file provides utility functions for mapping between backend and frontend KYC data structures.
 * It ensures consistent data transformation across the Accounts module.
 */

import type { KycRecord, KycSubmissionData, KycProviderSession } from '../../types/kyc.types';
import { KycStatus, KycProvider } from '../../types/kyc.types';

/**
 * Map backend KYC record to frontend format
 * @param backendRecord Backend KYC record data
 * @returns Frontend KYC record object
 */
export function mapBackendKycToFrontend(backendRecord: any): KycRecord {
  if (!backendRecord) return null;

  // Map the status from backend to frontend enum
  // Frontend KycStatus: NOT_SUBMITTED, PENDING, VERIFIED, REJECTED
  // Backend KycStatus: PENDING, VERIFIED, REJECTED
  let status = backendRecord.status;
  
  return {
    id: backendRecord.id,
    userId: backendRecord.userId,
    status: status as KycStatus,
    documentType: backendRecord.documentType,
    country: backendRecord.country,
    provider: backendRecord.provider as KycProvider,
    providerReference: backendRecord.providerReference,
    rejectionReason: backendRecord.rejectionReason,
    createdAt: backendRecord.createdAt ? new Date(backendRecord.createdAt) : undefined,
    updatedAt: backendRecord.updatedAt ? new Date(backendRecord.updatedAt) : undefined,
    verifiedAt: backendRecord.verifiedAt ? new Date(backendRecord.verifiedAt) : undefined
  };
}

/**
 * Map frontend KYC submission data to backend format
 * @param submissionData Frontend KYC submission data
 * @returns Backend KYC submission data object
 */
export function mapKycSubmissionToBackend(submissionData: KycSubmissionData): any {
  if (!submissionData) return null;
  
  return {
    documentType: submissionData.documentType,
    country: submissionData.country
  };
}

/**
 * Map backend KYC provider session to frontend format
 * @param backendSession Backend KYC provider session data
 * @returns Frontend KYC provider session object
 */
export function mapBackendSessionToFrontend(backendSession: any): KycProviderSession {
  if (!backendSession) return null;
  
  return {
    redirectUrl: backendSession.redirectUrl,
    expiresAt: backendSession.expiresAt ? new Date(backendSession.expiresAt) : undefined,
    referenceId: backendSession.referenceId
  };
}

/**
 * Map backend KYC records array to frontend format
 * @param backendRecords Array of backend KYC record data
 * @returns Array of frontend KYC record objects
 */
export function mapBackendKycArrayToFrontend(backendRecords: any[]): KycRecord[] {
  if (!backendRecords || !Array.isArray(backendRecords)) return [];
  return backendRecords.map(mapBackendKycToFrontend);
}

/**
 * Format country code to country name
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns Country name or original code if not found
 */
export function formatCountryName(countryCode: string): string {
  if (!countryCode) return '';
  
  const countries: Record<string, string> = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'JP': 'Japan',
    'CN': 'China',
    // Add more as needed
  };
  
  return countries[countryCode] || countryCode;
}

/**
 * Format document type to readable format
 * @param documentType Document type code
 * @returns Formatted document type name
 */
export function formatDocumentType(documentType: string): string {
  if (!documentType) return '';
  
  const documentTypes: Record<string, string> = {
    'passport': 'Passport',
    'driving_license': 'Driving License',
    'id_card': 'ID Card',
    'residence_permit': 'Residence Permit',
    // Add more as needed
  };
  
  return documentTypes[documentType] || documentType;
}

/**
 * Check if KYC status is verified
 * @param status KYC status
 * @returns True if status is verified, false otherwise
 */
export function isKycVerified(status: KycStatus): boolean {
  return status === KycStatus.VERIFIED;
}

/**
 * Format KYC status to readable format
 * @param status KYC status
 * @returns Formatted status string
 */
export function formatKycStatus(status: KycStatus): string {
  if (!status) return '';
  
  const statusMap: Record<KycStatus, string> = {
    [KycStatus.NOT_SUBMITTED]: 'Not Submitted',
    [KycStatus.PENDING]: 'Pending Verification',
    [KycStatus.VERIFIED]: 'Verified',
    [KycStatus.REJECTED]: 'Rejected'
  };
  
  return statusMap[status] || status;
}