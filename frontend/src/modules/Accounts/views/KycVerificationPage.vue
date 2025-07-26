<template>
  <div class="kyc-verification-page">
    <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">Identity Verification</h1>
      
      <div v-if="isLoading" class="flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
      
      <template v-else>
        <!-- Verified state -->
        <div v-if="isVerified" class="bg-green-50 rounded-lg p-6 mb-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-xl font-medium text-green-800">Verification Complete</h3>
              <div class="mt-3 text-base text-green-700">
                <p>Your identity has been successfully verified. You now have full access to all platform features.</p>
              </div>
              <div class="mt-4">
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

        <!-- Pending state -->
        <div v-else-if="isPending" class="bg-yellow-50 rounded-lg p-6 mb-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-xl font-medium text-yellow-800">Verification In Progress</h3>
              <div class="mt-3 text-base text-yellow-700">
                <p>Your identity verification is being processed. This usually takes 1-2 business days.</p>
                <p class="mt-2">We'll notify you once the verification is complete.</p>
              </div>
              <div class="mt-4">
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

        <!-- Rejected state -->
        <div v-else-if="isRejected" class="bg-red-50 rounded-lg p-6 mb-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-xl font-medium text-red-800">Verification Failed</h3>
              <div class="mt-3 text-base text-red-700">
                <p>{{ kycRecord?.rejectionReason || 'Your identity verification could not be completed.' }}</p>
                <p class="mt-2">Please try again with the following in mind:</p>
                <ul class="list-disc list-inside mt-2 space-y-1">
                  <li>Ensure your documents are clear and legible</li>
                  <li>Make sure your face is clearly visible in photos</li>
                  <li>Use valid, unexpired government-issued ID</li>
                </ul>
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

        <!-- Not submitted or new verification -->
        <div v-else>
          <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div class="px-4 py-5 sm:px-6">
              <h2 class="text-lg font-medium text-gray-900">Verification Process</h2>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">Complete the steps below to verify your identity</p>
            </div>
            <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div class="space-y-6">
                <div class="bg-gray-50 p-4 rounded-md">
                  <h3 class="text-base font-medium text-gray-900 mb-2">Important Information</h3>
                  <p class="text-sm text-gray-600">To complete the verification process, you will need:</p>
                  <ul class="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>A valid government-issued photo ID (passport, driver's license, or ID card)</li>
                    <li>A device with a camera for taking a selfie</li>
                    <li>Approximately 5-10 minutes to complete the process</li>
                  </ul>
                </div>
                
                <div class="space-y-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span class="text-white font-medium">1</span>
                    </div>
                    <div class="ml-4">
                      <h4 class="text-base font-medium text-gray-900">Prepare Your Documents</h4>
                      <p class="text-sm text-gray-600">Have your ID ready and ensure you're in a well-lit area</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span class="text-white font-medium">2</span>
                    </div>
                    <div class="ml-4">
                      <h4 class="text-base font-medium text-gray-900">Start Verification</h4>
                      <p class="text-sm text-gray-600">Click the button below to begin the verification process</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span class="text-white font-medium">3</span>
                    </div>
                    <div class="ml-4">
                      <h4 class="text-base font-medium text-gray-900">Complete Verification</h4>
                      <p class="text-sm text-gray-600">Follow the instructions to upload your ID and take a selfie</p>
                    </div>
                  </div>
                </div>
                
                <div class="pt-4">
                  <button 
                    @click="startVerification" 
                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    :disabled="isLoading"
                  >
                    Start Verification Process
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useKyc } from '../composables/useKyc';

const router = useRouter();
const {
  kycRecord,
  isLoading,
  isVerified,
  isPending,
  isRejected,
  isNotSubmitted,
  fetchKycRecord,
  initiateVerification
} = useKyc();

onMounted(async () => {
  await fetchKycRecord();
});

const startVerification = async () => {
  try {
    // In a real implementation, you would use a specific KYC provider
    // For now, we'll simulate initiating verification with a mock provider
    const session = await initiateVerification('sumsub', window.location.origin + '/account/kyc/callback');
    
    // Redirect to the provider's verification URL
    if (session.redirectUrl) {
      window.location.href = session.redirectUrl;
    }
  } catch (error) {
    console.error('Failed to start verification:', error);
  }
};

const goToAccount = () => {
  router.push('/account');
};
</script>