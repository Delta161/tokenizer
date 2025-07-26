<template>
  <div class="kyc-callback-page">
    <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Processing Your Verification</h1>
        
        <div v-if="isLoading" class="flex flex-col items-center justify-center p-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p class="text-gray-600">Please wait while we process your verification...</p>
        </div>
        
        <div v-else-if="error" class="bg-red-50 rounded-lg p-6 mb-6 text-left">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-xl font-medium text-red-800">Verification Error</h3>
              <div class="mt-3 text-base text-red-700">
                <p>{{ error.message || 'An error occurred during the verification process.' }}</p>
              </div>
              <div class="mt-4">
                <button 
                  @click="goToKycPage" 
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center">
          <svg class="mx-auto h-16 w-16 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <h3 class="mt-4 text-xl font-medium text-gray-900">Verification Submitted</h3>
          <p class="mt-2 text-gray-600">Your verification information has been submitted successfully.</p>
          <p class="mt-1 text-gray-600">We'll notify you once the verification process is complete.</p>
          
          <div class="mt-6">
            <button 
              @click="goToAccount" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Return to Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useKyc } from '../composables/useKyc';

const route = useRoute();
const router = useRouter();
const { fetchKycRecord } = useKyc();

const isLoading = ref(true);
const error = ref<Error | null>(null);
const success = ref(false);

onMounted(async () => {
  try {
    // Process query parameters from the callback URL
    const applicantId = route.query.applicantId as string;
    const externalUserId = route.query.externalUserId as string;
    const status = route.query.status as string;
    
    // In a real implementation, you would verify these parameters with your backend
    // For now, we'll just simulate a successful verification by fetching the KYC record
    
    // Wait a moment to simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fetch the updated KYC record
    await fetchKycRecord();
    
    success.value = true;
  } catch (err) {
    error.value = err as Error;
    console.error('Error processing KYC callback:', err);
  } finally {
    isLoading.value = false;
  }
});

const goToAccount = () => {
  router.push('/account');
};

const goToKycPage = () => {
  router.push('/account/kyc');
};
</script>