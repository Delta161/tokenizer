/**
 * KYC Service
 * 
 * This service handles KYC (Know Your Customer) related API calls.
 */

import apiClient from '@/services/apiClient';
import type { KycRecord, KycSubmissionData, KycProviderSession } from '../types/kycTypes';
import { KycStatus } from '../types/kycTypes';
import { handleServiceError } from '../utils/errorHandling';
import {
  mapBackendKycToFrontend,
  mapKycSubmissionToBackend,
  mapBackendSessionToFrontend,
  mapBackendKycArrayToFrontend,
  isKycVerified
} from '../utils/mappers';

export class KycService {
  /**
   * Get the current user's KYC record
   */
  static async getCurrentUserKyc(): Promise<KycRecord | null> {
    try {
      const response = await apiClient.get('/kyc/me');
      return mapBackendKycToFrontend(response.data.data);
    } catch (error) {
      // If 404, user hasn't submitted KYC yet
      if (error.response?.status === 404) {
        return null;
      }
      return handleServiceError(error, 'Failed to retrieve KYC information.');
    }
  }

  /**
   * Submit KYC information
   */
  static async submitKyc(data: KycSubmissionData): Promise<KycRecord> {
    try {
      const backendData = mapKycSubmissionToBackend(data);
      const response = await apiClient.post('/kyc/submit', backendData);
      return mapBackendKycToFrontend(response.data.data);
    } catch (error) {
      return handleServiceError(error, 'Failed to submit KYC information.');
    }
  }

  /**
   * Initiate KYC verification with a provider
   */
  static async initiateProviderVerification(
    provider: string,
    redirectUrl: string
  ): Promise<KycProviderSession> {
    try {
      const response = await apiClient.post(`/kyc/provider/${provider}/initiate`, {
        redirectUrl
      });
      return mapBackendSessionToFrontend(response.data.data);
    } catch (error) {
      return handleServiceError(error, `Failed to initiate verification with ${provider}.`);
    }
  }

  /**
   * Check if the current user has verified KYC
   */
  static async isKycVerified(): Promise<boolean> {
    try {
      const kycRecord = await this.getCurrentUserKyc();
      return kycRecord ? isKycVerified(kycRecord.status) : false;
    } catch (error) {
      // For this method, we want to return false on error rather than throwing
      // This is a special case where we handle the error differently
      handleServiceError(error, 'Failed to check KYC verification status.', false);
      return false;
    }
  }
}