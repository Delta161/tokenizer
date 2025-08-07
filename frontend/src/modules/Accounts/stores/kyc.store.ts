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
     * Check if KYC is pending
     */
    async checkKycPending(): Promise<boolean> {
      try {
        return await kycService.isKycPending();
      } catch (error: any) {
        console.warn('Error checking KYC pending status:', error);
        return false;
      }
    },

    /**
     * Check if KYC is rejected
     */
    async checkKycRejected(): Promise<boolean> {
      try {
        return await kycService.isKycRejected();
      } catch (error: any) {
        console.warn('Error checking KYC rejected status:', error);
        return false;
      }
    },

    /**
     * Check if user has submitted KYC
     */
    async checkKycSubmitted(): Promise<boolean> {
      try {
        return await kycService.hasSubmittedKyc();
      } catch (error: any) {
        console.warn('Error checking KYC submission status:', error);
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
        const healthStatus = await kycService.getKycHealth();
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