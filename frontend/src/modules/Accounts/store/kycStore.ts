/**
 * KYC Store
 * 
 * This store manages KYC state for the application.
 */

import { defineStore } from 'pinia';
import { KycService } from '../services/kycService';
import type { KycRecord, KycSubmissionData, KycProviderSession } from '../types/kycTypes';
import { KycStatus } from '../types/kycTypes';

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
        this.kycRecord = await KycService.getCurrentUserKyc();
      } catch (error) {
        this.error = error.message || 'Failed to fetch KYC record';
        console.error('Error fetching KYC record:', error);
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
        this.kycRecord = await KycService.submitKyc(data);
        return this.kycRecord;
      } catch (error) {
        this.error = error.message || 'Failed to submit KYC';
        console.error('Error submitting KYC:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Initiate KYC verification with a provider
     */
    async initiateVerification(
      provider: string,
      redirectUrl: string
    ): Promise<KycProviderSession> {
      this.isLoading = true;
      this.error = null;
      
      try {
        const session = await KycService.initiateProviderVerification(provider, redirectUrl);
        return session;
      } catch (error) {
        this.error = error.message || 'Failed to initiate KYC verification';
        console.error('Error initiating KYC verification:', error);
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