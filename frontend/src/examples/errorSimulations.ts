import type { Ref } from 'vue';
import { ErrorType } from '@/services/errorHandler';
import type { ErrorHandler } from '@/services/errorHandler';
import type { ErrorStore } from '@/stores/errorStore';

// Example of loading data with error handling
export async function loadExampleData(
  get: (url: string) => Promise<any>,
  exampleData: Ref<any>,
  loadingError: Ref<string>,
  errorStore: ErrorStore,
  errorHandler: ErrorHandler,
  ErrorType: typeof ErrorType
) {
  loadingError.value = '';
  
  try {
    exampleData.value = await get('/example-data');
  } catch (error) {
    // Process the error through our error handler
    const appError = errorHandler.processError(error);
    loadingError.value = appError.message;
    
    // For critical errors, set as global error
    if (
      appError.type === ErrorType.SERVER || 
      appError.type === ErrorType.NETWORK
    ) {
      errorStore.setGlobalError(appError);
    }
  }
}

// Simulate different error types for demonstration
export async function simulateNetworkError(
  get: (url: string) => Promise<any>,
  errorHandler: ErrorHandler
) {
  try {
    await get('/simulate-network-error');
  } catch (error) {
    errorHandler.showErrorNotification(error);
  }
}

export async function simulateServerError(
  get: (url: string) => Promise<any>,
  errorHandler: ErrorHandler
) {
  try {
    await get('/simulate-server-error');
  } catch (error) {
    errorHandler.showErrorNotification(error);
  }
}

export async function simulateValidationError(
  post: (url: string, data: any) => Promise<any>,
  handleApiValidationErrors: (error: any) => void
) {
  try {
    await post('/simulate-validation-error', {});
  } catch (error) {
    handleApiValidationErrors(error);
  }
}

export async function simulateAuthError(
  get: (url: string) => Promise<any>,
  errorHandler: ErrorHandler
) {
  try {
    await get('/simulate-auth-error');
  } catch (error) {
    errorHandler.showErrorNotification(error);
  }
}