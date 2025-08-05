/**
 * KYC Store
 * 
 * This store manages KYC state for the application.
 * Updated to work with refactored backend KYC endpoints.
 */

import { defineStore } from 'pinia';
import { kycService } from '../services/kyc.service';
import type { KycRecord, KycSubmissionData } from '../types/kyc.types';
import { KycStatus } from '../types/kyc.types';

export const useKycStore = defineStore('kyc', {
  state: () => ({
    kycRecord: null as KycRecord | null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    isVerified: (state) => state.kycRecord?.status === KycStatus.VERIFIED,
    isPending: (state) => state.kycRecord?.status === KycStatus.PENDING,
    isRejected: (state) => state.kycRecord?.status === KycStatus.REJECTED,
    isNotSubmitted: (state) => 
      !state.kycRecord || state.kycRecord.status === KycStatus.NOT_SUBMITTED,
  },

  actions: {
    /**
     * Fetch the current user's KYC record
     */
    async fetchKycRecord() {
      this.isLoading = true;
      this.error = null;
      
      try {
        this.kycRecord = await kycService.getCurrentUserKyc();
        return this.kycRecord;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch KYC record';
        console.error('Error fetching KYC record:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Submit KYC information
     */
    async submitKyc(data: KycSubmissionData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        this.kycRecord = await kycService.submitKyc(data);
        return this.kycRecord;
      } catch (error: any) {
        this.error = error.message || 'Failed to submit KYC';
        console.error('Error submitting KYC:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Upload KYC documents
     */
    async uploadDocuments(documents: FormData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const result = await kycService.uploadDocuments(documents);
        // Refresh KYC record after document upload
        await this.fetchKycRecord();
        return result;
      } catch (error: any) {
        this.error = error.message || 'Failed to upload KYC documents';
        console.error('Error uploading KYC documents:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Check if KYC is verified
     */
    async checkKycVerification(): Promise<boolean> {
      try {
        return await kycService.isKycVerified();
      } catch (error: any) {
        console.warn('Error checking KYC verification:', error);
        return false;
      }
    },

    /**
     * Get KYC service health status
     */
    async getHealthStatus() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const healthStatus = await kycService.getHealthStatus();
        return healthStatus;
      } catch (error: any) {
        this.error = error.message || 'Failed to get KYC health status';
        console.error('Error getting KYC health status:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Reset the store state
     */
    resetState() {
      this.kycRecord = null;
      this.isLoading = false;
      this.error = null;
    },
  },
});