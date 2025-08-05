<template>
  <div class="kyc-verification-status">
    <div v-if="isLoading" class="flex items-center justify-center p-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
    
    <div v-else>
      <!-- Not submitted state -->
      <div v-if="isNotSubmitted" class="bg-gray-100 rounded-lg p-4 mb-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-gray-700">Identity Verification Required</h3>
            <div class="mt-2 text-sm text-gray-600">
              <p>Complete your identity verification to unlock all platform features.</p>
            </div>
            <div class="mt-4">
              <button 
                @click="startVerification" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Start Verification
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending state -->
      <div v-else-if="isPending" class="bg-yellow-50 rounded-lg p-4 mb-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-yellow-800">Verification In Progress</h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>Your identity verification is being processed. This usually takes 1-2 business days.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Verified state -->
      <div v-else-if="isVerified" class="bg-green-50 rounded-lg p-4 mb-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-green-800">Verification Complete</h3>
            <div class="mt-2 text-sm text-green-700">
              <p>Your identity has been successfully verified. You now have full access to all platform features.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rejected state -->
      <div v-else-if="isRejected" class="bg-red-50 rounded-lg p-4 mb-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-red-800">Verification Failed</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ kycRecord?.rejectionReason || 'Your identity verification could not be completed. Please try again.' }}</p>
            </div>
            <div class="mt-4">
              <button 
                @click="startVerification" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useKyc } from '../composables/useKyc';
import { useRouter } from 'vue-router';

const props = defineProps({
  autoLoad: {
    type: Boolean,
    default: true
  }
});

const router = useRouter();
const {
  kycRecord,
  isLoading,
  isVerified,
  isPending,
  isRejected,
  isNotSubmitted,
  fetchKycRecord
} = useKyc();

onMounted(async () => {
  if (props.autoLoad) {
    await fetchKycRecord();
  }
});

const startVerification = async () => {
  try {
    // Redirect to KYC verification page
    router.push('/account/kyc');
  } catch (error) {
    console.error('Failed to start verification:', error);
  }
};
</script>