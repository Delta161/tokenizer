/**
 * useKyc Composable
 * 
 * This composable provides KYC functionality for Vue components.
 * Updated to work with refactored backend KYC endpoints.
 */

import { ref, computed } from 'vue';
import { kycService } from '../services/kyc.service';
import type { KycRecord, KycSubmissionData } from '../types/kyc.types';
import { KycStatus } from '../types/kyc.types';

export function useKyc() {
  const kycRecord = ref<KycRecord | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  // Computed properties for KYC status
  const isVerified = computed(() => kycRecord.value?.status === KycStatus.VERIFIED);
  const isPending = computed(() => kycRecord.value?.status === KycStatus.PENDING);
  const isRejected = computed(() => kycRecord.value?.status === KycStatus.REJECTED);
  const isNotSubmitted = computed(() => 
    !kycRecord.value || kycRecord.value.status === KycStatus.NOT_SUBMITTED
  );

  /**
   * Fetch the current user's KYC record
   */
  const fetchKycRecord = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      kycRecord.value = await kycService.getCurrentUserKyc();
    } catch (err) {
      error.value = err as Error;
      console.error('Error fetching KYC record:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Submit KYC information
   */
  const submitKyc = async (data: KycSubmissionData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      kycRecord.value = await kycService.submitKyc(data);
      return kycRecord.value;
    } catch (err) {
      error.value = err as Error;
      console.error('Error submitting KYC:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Check if KYC is verified
   */
  const checkKycVerification = async (): Promise<boolean> => {
    try {
      return await kycService.isKycVerified();
    } catch (err) {
      console.warn('Error checking KYC verification:', err);
      return false;
    }
  };

  /**
   * Check if KYC is pending
   */
  const checkKycPending = async (): Promise<boolean> => {
    try {
      return await kycService.isKycPending();
    } catch (err) {
      console.warn('Error checking KYC pending status:', err);
      return false;
    }
  };

  /**
   * Check if KYC is rejected
   */
  const checkKycRejected = async (): Promise<boolean> => {
    try {
      return await kycService.isKycRejected();
    } catch (err) {
      console.warn('Error checking KYC rejected status:', err);
      return false;
    }
  };

  /**
   * Check if user has submitted KYC
   */
  const checkKycSubmitted = async (): Promise<boolean> => {
    try {
      return await kycService.hasSubmittedKyc();
    } catch (err) {
      console.warn('Error checking KYC submission status:', err);
      return false;
    }
  };

  /**
   * Get KYC service health status
   */
  const getHealthStatus = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const health = await kycService.getKycHealth();
      return health;
    } catch (err) {
      error.value = err as Error;
      console.error('Error getting KYC health status:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    kycRecord,
    isLoading,
    error,
    isVerified,
    isPending,
    isRejected,
    isNotSubmitted,
    fetchKycRecord,
    submitKyc,
    checkKycVerification,
    checkKycPending,
    checkKycRejected,
    checkKycSubmitted,
    getHealthStatus
  };
}