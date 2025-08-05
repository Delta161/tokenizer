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
   * Upload KYC documents
   */
  const uploadDocuments = async (documents: FormData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await kycService.uploadDocuments(documents);
      // Refresh KYC record after document upload
      await fetchKycRecord();
      return result;
    } catch (err) {
      error.value = err as Error;
      console.error('Error uploading KYC documents:', err);
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
    uploadDocuments,
    checkKycVerification
  };
}