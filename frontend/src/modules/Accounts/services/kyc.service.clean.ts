/**
 * KYC Service
 * Complete service covering all backend KYC endpoints
 */

import apiClient from '../../../services/apiClient';
import type { KycRecord, KycSubmissionData } from '../types/kyc.types';
import { KycStatus } from '../types/kyc.types';
import { handleServiceError } from '../utils/errorHandling';

export class KycService {
  private baseUrl = '/kyc';

  // =============================================================================
  // KYC STATUS AND RETRIEVAL
  // =============================================================================

  /**
   * Get the current user's KYC record via /kyc/me
   */
  async getCurrentUserKyc(): Promise<KycRecord | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/me`);
      const kycData = response.data.data;
      
      // Convert backend response to frontend format
      return {
        id: kycData.id,
        userId: kycData.userId,
        status: kycData.status as KycStatus,
        submittedAt: kycData.submittedAt,
        reviewedAt: kycData.reviewedAt,
        verifiedAt: kycData.verifiedAt,
        rejectionReason: kycData.rejectionReason,
        documentsUploaded: kycData.documentsUploaded,
        personalInfoComplete: kycData.personalInfoComplete,
        addressVerified: kycData.addressVerified,
        createdAt: kycData.createdAt,
        updatedAt: kycData.updatedAt
      };
    } catch (error: any) {
      // If 404, user hasn't submitted KYC yet
      if (error.response?.status === 404) {
        return null;
      }
      handleServiceError(error, 'Failed to retrieve KYC information.');
      throw error;
    }
  }

  /**
   * Check KYC health endpoint
   */
  async getKycHealth(): Promise<{ success: boolean; message: string; timestamp: string }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      handleServiceError(error, 'Failed to check KYC service health.');
      throw error;
    }
  }

  // =============================================================================
  // KYC SUBMISSION AND UPDATES
  // =============================================================================

  /**
   * Submit KYC information via /kyc/submit
   */
  async submitKyc(data: KycSubmissionData): Promise<KycRecord> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/submit`, data);
      const kycData = response.data.data;
      
      return {
        id: kycData.id,
        userId: kycData.userId,
        status: kycData.status as KycStatus,
        submittedAt: kycData.submittedAt,
        reviewedAt: kycData.reviewedAt,
        verifiedAt: kycData.verifiedAt,
        rejectionReason: kycData.rejectionReason,
        documentsUploaded: kycData.documentsUploaded,
        personalInfoComplete: kycData.personalInfoComplete,
        addressVerified: kycData.addressVerified,
        createdAt: kycData.createdAt,
        updatedAt: kycData.updatedAt
      };
    } catch (error) {
      handleServiceError(error, 'Failed to submit KYC information.');
      throw error;
    }
  }

  // =============================================================================
  // KYC STATUS HELPERS
  // =============================================================================

  /**
   * Check if user is KYC verified
   */
  async isKycVerified(): Promise<boolean> {
    try {
      const kyc = await this.getCurrentUserKyc();
      return kyc?.status === KycStatus.VERIFIED;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if KYC is pending review
   */
  async isKycPending(): Promise<boolean> {
    try {
      const kyc = await this.getCurrentUserKyc();
      return kyc?.status === KycStatus.PENDING;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if KYC was rejected
   */
  async isKycRejected(): Promise<boolean> {
    try {
      const kyc = await this.getCurrentUserKyc();
      return kyc?.status === KycStatus.REJECTED;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has submitted KYC
   */
  async hasSubmittedKyc(): Promise<boolean> {
    try {
      const kyc = await this.getCurrentUserKyc();
      return kyc !== null && kyc.status !== KycStatus.NOT_SUBMITTED;
    } catch (error) {
      return false;
    }
  }
}

export const kycService = new KycService();
