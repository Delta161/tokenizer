<template>
  <div class="kyc-view">
    <!-- KYC Callback Handler (shown when handling callback) -->
    <div v-if="isCallback" class="kyc-callback-section">
      <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-2xl font-semibold text-gray-900 mb-6">Processing Your Verification</h1>
          
          <div v-if="callbackLoading" class="flex flex-col items-center justify-center p-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p class="text-gray-600">Please wait while we process your verification...</p>
          </div>
          
          <div v-else-if="callbackError" class="bg-red-50 rounded-lg p-6 mb-6 text-left">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-xl font-medium text-red-800">Verification Error</h3>
                <div class="mt-3 text-base text-red-700">
                  <p>{{ callbackError.message || 'An error occurred during the verification process.' }}</p>
                </div>
                <div class="mt-4">
                  <button 
                    @click="switchToVerification" 
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

    <!-- Main KYC Verification Page -->
    <div v-else class="kyc-verification-section">
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
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div class="text-center">
                    <div class="w-12 h-12 mx-auto bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg mb-4">
                      1
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Prepare Documents</h3>
                    <p class="text-sm text-gray-500">Have your government-issued ID ready (passport, driver's license, or national ID card)</p>
                  </div>
                  
                  <div class="text-center">
                    <div class="w-12 h-12 mx-auto bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg mb-4">
                      2
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Take Photos</h3>
                    <p class="text-sm text-gray-500">Take clear photos of your ID and yourself. Ensure good lighting and all text is readable</p>
                  </div>
                  
                  <div class="text-center">
                    <div class="w-12 h-12 mx-auto bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg mb-4">
                      3
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Submit & Wait</h3>
                    <p class="text-sm text-gray-500">Submit your verification and wait for approval. This usually takes 1-2 business days</p>
                  </div>
                </div>
                
                <div class="mt-8 text-center">
                  <button 
                    @click="startVerification" 
                    class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Start Verification
                  </button>
                </div>
              </div>
            </div>

            <!-- Requirements section -->
            <div class="bg-blue-50 rounded-lg p-6">
              <h3 class="text-lg font-medium text-blue-900 mb-4">Requirements</h3>
              <ul class="space-y-2 text-blue-800">
                <li class="flex items-start">
                  <svg class="flex-shrink-0 h-5 w-5 text-blue-400 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Valid, unexpired government-issued photo ID
                </li>
                <li class="flex items-start">
                  <svg class="flex-shrink-0 h-5 w-5 text-blue-400 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Good lighting and high-quality photos
                </li>
                <li class="flex items-start">
                  <svg class="flex-shrink-0 h-5 w-5 text-blue-400 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Face clearly visible and matching ID photo
                </li>
                <li class="flex items-start">
                  <svg class="flex-shrink-0 h-5 w-5 text-blue-400 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  All text and details must be clearly readable
                </li>
              </ul>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useKyc } from '../composables/useKyc';
import { KycStatus } from '../types/kyc.types';

const route = useRoute();
const router = useRouter();
const { kycRecord, fetchKycRecord, initiateVerification } = useKyc();

// Main loading state
const isLoading = ref(true);

// Callback specific states
const callbackLoading = ref(true);
const callbackError = ref<Error | null>(null);
const callbackSuccess = ref(false);

// Determine if we're in callback mode
const isCallback = computed(() => route.path.includes('/callback'));

// KYC status computed properties
const isVerified = computed(() => kycRecord.value?.status === KycStatus.VERIFIED);
const isPending = computed(() => kycRecord.value?.status === KycStatus.PENDING);
const isRejected = computed(() => kycRecord.value?.status === KycStatus.REJECTED);

onMounted(async () => {
  try {
    if (isCallback.value) {
      await handleCallback();
    } else {
      // Regular KYC page - fetch current KYC record
      await fetchKycRecord();
    }
  } catch (error) {
    console.error('Error loading KYC data:', error);
  } finally {
    isLoading.value = false;
  }
});

const handleCallback = async () => {
  try {
    // Process query parameters from the callback URL
    const applicantId = route.query.applicantId as string;
    const externalUserId = route.query.externalUserId as string;
    const status = route.query.status as string;
    
    // Wait a moment to simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fetch the updated KYC record
    await fetchKycRecord();
    
    callbackSuccess.value = true;
  } catch (err) {
    callbackError.value = err as Error;
    console.error('Error processing KYC callback:', err);
  } finally {
    callbackLoading.value = false;
  }
};

const startVerification = async () => {
  try {
    isLoading.value = true;
    await initiateVerification('sumsub', window.location.origin + '/account/kyc/callback');
  } catch (error) {
    console.error('Error starting verification:', error);
  } finally {
    isLoading.value = false;
  }
};

const switchToVerification = () => {
  router.push('/account/kyc');
};

const goToAccount = () => {
  router.push('/account');
};
</script>

<style scoped>
.kyc-view {
  min-height: 100vh;
  background-color: var(--color-background);
}

.kyc-callback-section,
.kyc-verification-section {
  width: 100%;
}

/* Animation classes */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Button focus styles */
button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .md\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
