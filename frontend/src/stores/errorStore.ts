import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AppError } from '@/services/errorHandler';
import { ErrorType } from '@/services/errorHandler';

/**
 * Store for managing application errors
 */
export const useErrorStore = defineStore('error', () => {
  // State
  const errors = ref<AppError[]>([]);
  const globalError = ref<AppError | null>(null);
  const maxErrors = 50;
  const retryQueue = ref<{ id: string; callback: () => Promise<any>; retryCount: number }[]>([]);
  const maxRetries = 3;

  // Getters
  const hasErrors = computed(() => errors.value.length > 0);
  const latestError = computed(() => errors.value[0] || null);
  const errorsByType = computed(() => {
    const result: Record<ErrorType, AppError[]> = {
      [ErrorType.VALIDATION]: [],
      [ErrorType.AUTHENTICATION]: [],
      [ErrorType.AUTHORIZATION]: [],
      [ErrorType.NOT_FOUND]: [],
      [ErrorType.NETWORK]: [],
      [ErrorType.SERVER]: [],
      [ErrorType.TIMEOUT]: [],
      [ErrorType.UNKNOWN]: []
    };

    errors.value.forEach(error => {
      result[error.type].push(error);
    });

    return result;
  });

  // Actions
  /**
   * Add an error to the store
   */
  function addError(error: AppError) {
    errors.value.unshift(error);
    
    // Trim errors if they exceed max size
    if (errors.value.length > maxErrors) {
      errors.value = errors.value.slice(0, maxErrors);
    }

    return error;
  }

  /**
   * Set a global error (e.g., for displaying in a global error banner)
   */
  function setGlobalError(error: AppError | null) {
    globalError.value = error;
  }

  /**
   * Clear all errors
   */
  function clearErrors() {
    errors.value = [];
    globalError.value = null;
  }

  /**
   * Clear global error
   */
  function clearGlobalError() {
    globalError.value = null;
  }

  /**
   * Add a function to the retry queue
   */
  function addToRetryQueue(id: string, callback: () => Promise<any>) {
    // Check if already in queue
    const existing = retryQueue.value.find(item => item.id === id);
    if (existing) {
      // Update callback if already exists
      existing.callback = callback;
      return;
    }

    // Add to queue
    retryQueue.value.push({
      id,
      callback,
      retryCount: 0
    });
  }

  /**
   * Retry a specific item in the queue
   */
  async function retry(id: string): Promise<boolean> {
    const itemIndex = retryQueue.value.findIndex(item => item.id === id);
    if (itemIndex === -1) return false;

    const item = retryQueue.value[itemIndex];
    if (item.retryCount >= maxRetries) {
      // Remove from queue if max retries reached
      retryQueue.value.splice(itemIndex, 1);
      return false;
    }

    try {
      // Increment retry count
      item.retryCount++;
      
      // Execute callback
      await item.callback();
      
      // Remove from queue on success
      retryQueue.value.splice(itemIndex, 1);
      return true;
    } catch (error) {
      // Keep in queue for potential future retry
      return false;
    }
  }

  /**
   * Retry all items in the queue
   */
  async function retryAll(): Promise<boolean> {
    if (retryQueue.value.length === 0) return false;

    const results = await Promise.all(
      retryQueue.value.map(item => retry(item.id))
    );

    return results.some(result => result);
  }

  /**
   * Clear the retry queue
   */
  function clearRetryQueue() {
    retryQueue.value = [];
  }

  return {
    // State
    errors,
    globalError,
    retryQueue,
    
    // Getters
    hasErrors,
    latestError,
    errorsByType,
    
    // Actions
    addError,
    setGlobalError,
    clearErrors,
    clearGlobalError,
    addToRetryQueue,
    retry,
    retryAll,
    clearRetryQueue
  };
});