/**
 * KYC Service
 * Updated to work with refactored backend KYC endpoints.
 */

import apiClient from '../../../services/apiClient';
import type { KycRecord, KycSubmissionData } from '../types/kyc.types';
import { KycStatus } from '../types/kyc.types';
import { handleServiceError } from '../utils/errorHandling';

export class KycService {
  private baseUrl = '/kyc';

  /**
   * Get the current user's KYC record
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
   * Submit KYC information
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

  /**
   * Upload KYC documents
   */
  async uploadDocuments(documents: FormData): Promise<{ documentId: string; uploadedAt: string }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/documents`, documents, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    } catch (error) {
      handleServiceError(error, 'Failed to upload KYC documents.');
      throw error;
    }
  }

  /**
   * Check if the current user has verified KYC
   */
  async isKycVerified(): Promise<boolean> {
    try {
      const kycRecord = await this.getCurrentUserKyc();
      return kycRecord ? kycRecord.status === KycStatus.VERIFIED : false;
    } catch (error) {
      // For this method, we want to return false on error rather than throwing
      console.warn('Failed to check KYC verification status:', error);
      return false;
    }
  }

  /**
   * Get KYC health status
   */
  async getHealthStatus(): Promise<{ success: boolean; message: string; timestamp: string }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      handleServiceError(error, 'Failed to get KYC service health status.');
      throw error;
    }
  }
}

export const kycService = new KycService();