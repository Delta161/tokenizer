import errorHandler from '@/services/errorHandler';
import { useErrorStore } from '@/stores/errorStore';
import type { AppError } from '@/services/errorHandler';
import { ErrorType } from '@/services/errorHandler';

/**
 * Standardized error handling utility for Accounts module
 * 
 * This utility provides consistent error handling patterns for all
 * components and services in the Accounts module.
 */

/**
 * Handle service-level errors
 * 
 * @param error - The error to handle
 * @param errorMessage - Optional custom error message
 * @param rethrow - Whether to rethrow the error (default: true)
 * @returns The processed AppError object
 */
export function handleServiceError(error: unknown, errorMessage?: string, rethrow = true): AppError {
  // Process the error using the central error handler
  const appError = errorHandler.processError(error);
  
  // Override message if provided
  if (errorMessage) {
    appError.message = errorMessage;
  }
  
  // Log the error
  console.error('Service error:', appError);
  
  // Rethrow if needed (for propagation to stores/components)
  if (rethrow) {
    throw appError;
  }
  
  return appError;
}

/**
 * Handle store-level errors
 * 
 * @param error - The error to handle
 * @param storeErrorState - Reference to the store's error state
 * @param errorMessage - Optional custom error message
 * @param rethrow - Whether to rethrow the error (default: false)
 * @returns The processed AppError object
 */
export function handleStoreError(error: unknown, storeErrorState: any, errorMessage?: string, rethrow = false): AppError {
  // Process the error using the central error handler
  const appError = errorHandler.processError(error);
  
  // Override message if provided
  if (errorMessage) {
    appError.message = errorMessage;
  }
  
  // Update store error state
  if (storeErrorState !== undefined) {
    storeErrorState = appError.message;
  }
  
  // Add to error store
  try {
    const errorStore = useErrorStore();
    errorStore.addError(appError);
    
    // Set as global error for critical errors
    if (
      appError.type === ErrorType.SERVER || 
      appError.type === ErrorType.NETWORK ||
      appError.type === ErrorType.AUTHENTICATION
    ) {
      errorStore.setGlobalError(appError);
    }
  } catch (e) {
    // Store might not be available
    console.warn('Error store not available', e);
  }
  
  // Log the error
  console.error('Store error:', appError);
  
  // Rethrow if needed (for propagation to components)
  if (rethrow) {
    throw appError;
  }
  
  return appError;
}

/**
 * Handle component-level errors
 * 
 * @param error - The error to handle
 * @param componentErrorRef - Reference to the component's error ref
 * @param showNotification - Whether to show a notification (default: true)
 * @returns The processed AppError object
 */
export function handleComponentError(error: unknown, componentErrorRef?: any, showNotification = true): AppError {
  // Process the error using the central error handler
  const appError = errorHandler.processError(error);
  
  // Update component error ref if provided
  if (componentErrorRef !== undefined) {
    componentErrorRef.value = appError.message;
  }
  
  // Show notification if requested
  if (showNotification) {
    errorHandler.showErrorNotification(appError);
  }
  
  // Log the error
  console.error('Component error:', appError);
  
  return appError;
}

/**
 * Create a retry function for failed operations
 * 
 * @param id - Unique identifier for the operation
 * @param callback - The function to retry
 */
export function addToRetryQueue(id: string, callback: () => Promise<any>): void {
  errorHandler.addToRetryQueue(id, callback);
}

/**
 * Retry a specific operation
 * 
 * @param id - Unique identifier for the operation
 * @returns Promise resolving to success status
 */
export function retry(id: string): Promise<boolean> {
  return errorHandler.retry(id);
}

/**
 * Retry all operations in the queue
 * 
 * @returns Promise resolving to success status
 */
export function retryAll(): Promise<boolean> {
  return errorHandler.retryAll();
}