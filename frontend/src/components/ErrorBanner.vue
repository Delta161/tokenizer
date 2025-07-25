<script setup lang="ts">
import { computed } from 'vue';
import { useErrorStore } from '@/stores/errorStore';
import { ErrorType } from '@/services/errorHandler';
import errorHandler from '@/services/errorHandler';

const errorStore = useErrorStore();

// Computed properties
const hasGlobalError = computed(() => errorStore.globalError !== null);
const errorMessage = computed(() => errorStore.globalError?.message || '');
const errorType = computed(() => errorStore.globalError?.type || ErrorType.UNKNOWN);

// Methods
const dismissError = () => {
  errorStore.clearGlobalError();
};

const retryAll = async () => {
  const success = await errorHandler.retryAll();
  if (success) {
    errorStore.clearGlobalError();
  }
};

// Computed styles based on error type
const bannerClass = computed(() => {
  switch (errorType.value) {
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      return 'bg-yellow-100 border-yellow-400 text-yellow-800';
    case ErrorType.SERVER:
      return 'bg-red-100 border-red-400 text-red-800';
    case ErrorType.NETWORK:
    case ErrorType.TIMEOUT:
      return 'bg-orange-100 border-orange-400 text-orange-800';
    default:
      return 'bg-gray-100 border-gray-400 text-gray-800';
  }
});

// Determine if retry button should be shown
const showRetryButton = computed(() => {
  return (
    errorType.value === ErrorType.NETWORK ||
    errorType.value === ErrorType.TIMEOUT ||
    errorType.value === ErrorType.SERVER
  ) && errorStore.retryQueue.length > 0;
});
</script>

<template>
  <div
    v-if="hasGlobalError"
    :class="['border-l-4 p-4 mb-4', bannerClass]"
    role="alert"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <!-- Icon based on error type -->
        <div class="mr-3">
          <svg
            v-if="errorType === ErrorType.NETWORK || errorType === ErrorType.TIMEOUT"
            class="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="errorType === ErrorType.SERVER"
            class="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else
            class="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        
        <!-- Error message -->
        <p class="font-medium">{{ errorMessage }}</p>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Retry button -->
        <button
          v-if="showRetryButton"
          @click="retryAll"
          class="px-3 py-1 text-sm rounded-md bg-white border border-current hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
        >
          Retry
        </button>
        
        <!-- Dismiss button -->
        <button
          @click="dismissError"
          class="text-current hover:text-gray-600 focus:outline-none"
          aria-label="Dismiss"
        >
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>