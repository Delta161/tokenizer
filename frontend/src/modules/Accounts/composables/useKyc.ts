/**
 * useKyc Composable
 * 
 * This composable provides KYC functionality for Vue components.
 */

import { ref, computed } from 'vue';
import { KycService } from '../services/kyc.service';
import type { KycRecord, KycSubmissionData, KycProviderSession } from '../types/kyc.types';
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
      kycRecord.value = await KycService.getCurrentUserKyc();
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
      kycRecord.value = await KycService.submitKyc(data);
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
   * Initiate KYC verification with a provider
   */
  const initiateVerification = async (
    provider: string,
    redirectUrl: string
  ): Promise<KycProviderSession> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const session = await KycService.initiateProviderVerification(provider, redirectUrl);
      return session;
    } catch (err) {
      error.value = err as Error;
      console.error('Error initiating KYC verification:', err);
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
    initiateVerification
  };
}