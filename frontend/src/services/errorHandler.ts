import { AxiosError } from 'axios';
import { useGlobalNotification } from '@/composables/useNotification';
import { useErrorStore } from '@/stores/errorStore';

/**
 * Error types for categorizing different errors
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Structured error response from backend
 */
export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errorCode: string;
  details?: Record<string, any>;
  stack?: string;
}

/**
 * Frontend error object with additional context
 */
export interface AppError {
  type: ErrorType;
  message: string;
  errorCode?: string;
  details?: Record<string, any>;
  originalError?: Error | AxiosError;
  timestamp: number;
}

/**
 * Error handler service for processing and displaying errors
 */
class ErrorHandler {
  private notification = useGlobalNotification();
  private errorHistory: AppError[] = [];
  private maxHistorySize = 50;

  /**
   * Process an error and return a structured AppError
   */
  processError(error: unknown): AppError {
    // Default error structure
    const appError: AppError = {
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred',
      timestamp: Date.now()
    };

    // Handle Axios errors
    if (this.isAxiosError(error)) {
      return this.processAxiosError(error);
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      appError.message = error.message;
      appError.originalError = error;

      // Categorize based on error name
      if (error.name === 'ValidationError') {
        appError.type = ErrorType.VALIDATION;
      }
    }

    // Add to history and store
    this.addToHistory(appError);
    
    // Add to error store if available
    try {
      const errorStore = useErrorStore();
      errorStore.addError(appError);
    } catch (e) {
      // Store might not be available during SSR or early initialization
      console.warn('Error store not available', e);
    }
    
    return appError;
  }

  /**
   * Process Axios errors with backend response data
   */
  private processAxiosError(error: AxiosError): AppError {
    const appError: AppError = {
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred',
      timestamp: Date.now(),
      originalError: error
    };

    // Network errors (no response)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        appError.type = ErrorType.TIMEOUT;
        appError.message = 'Request timed out. Please try again.';
      } else {
        appError.type = ErrorType.NETWORK;
        appError.message = 'Network error. Please check your connection.';
      }
      return this.addToHistory(appError);
    }

    // Server responded with error status
    const { status } = error.response;
    const data = error.response.data as ApiErrorResponse;

    // Set error code and details if available
    if (data) {
      appError.message = data.message || appError.message;
      appError.errorCode = data.errorCode;
      appError.details = data.details;
    }

    // Categorize based on status code
    switch (status) {
      case 400:
        appError.type = ErrorType.VALIDATION;
        break;
      case 401:
        appError.type = ErrorType.AUTHENTICATION;
        break;
      case 403:
        appError.type = ErrorType.AUTHORIZATION;
        break;
      case 404:
        appError.type = ErrorType.NOT_FOUND;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        appError.type = ErrorType.SERVER;
        break;
      default:
        appError.type = ErrorType.UNKNOWN;
    }

    return this.addToHistory(appError);
  }

  /**
   * Display an error notification to the user
   */
  showErrorNotification(error: AppError | unknown): void {
    const appError = error instanceof Object && 'type' in error ? error : this.processError(error);
    
    // Customize notification based on error type
    const options = {
      title: this.getErrorTitle(appError.type),
      duration: 5000
    };

    // Show notification
    this.notification.error(appError.message, options);
    
    // Set as global error for critical errors
    if (
      appError.type === ErrorType.SERVER || 
      appError.type === ErrorType.NETWORK ||
      appError.type === ErrorType.AUTHENTICATION
    ) {
      try {
        const errorStore = useErrorStore();
        errorStore.setGlobalError(appError);
      } catch (e) {
        // Store might not be available
      }
    }
  }

  /**
   * Get user-friendly error title based on error type
   */
  private getErrorTitle(type: ErrorType): string {
    switch (type) {
      case ErrorType.VALIDATION:
        return 'Validation Error';
      case ErrorType.AUTHENTICATION:
        return 'Authentication Error';
      case ErrorType.AUTHORIZATION:
        return 'Authorization Error';
      case ErrorType.NOT_FOUND:
        return 'Not Found';
      case ErrorType.NETWORK:
        return 'Network Error';
      case ErrorType.SERVER:
        return 'Server Error';
      case ErrorType.TIMEOUT:
        return 'Request Timeout';
      default:
        return 'Error';
    }
  }

  /**
   * Add error to history and maintain max size
   */
  private addToHistory(error: AppError): AppError {
    this.errorHistory.unshift(error);
    
    // Trim history if it exceeds max size
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
    
    return error;
  }

  /**
   * Get error history
   */
  getErrorHistory(): AppError[] {
    try {
      const errorStore = useErrorStore();
      return errorStore.errors;
    } catch (e) {
      // Fallback to local history if store is not available
      return [...this.errorHistory];
    }
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    
    try {
      const errorStore = useErrorStore();
      errorStore.clearErrors();
    } catch (e) {
      // Store might not be available
    }
  }
  
  /**
   * Add a function to the retry queue
   */
  addToRetryQueue(id: string, callback: () => Promise<any>): void {
    try {
      const errorStore = useErrorStore();
      errorStore.addToRetryQueue(id, callback);
    } catch (e) {
      // Store might not be available
      console.warn('Could not add to retry queue', e);
    }
  }
  
  /**
   * Retry a specific operation
   */
  async retry(id: string): Promise<boolean> {
    try {
      const errorStore = useErrorStore();
      return await errorStore.retry(id);
    } catch (e) {
      // Store might not be available
      return false;
    }
  }
  
  /**
   * Retry all operations in the queue
   */
  async retryAll(): Promise<boolean> {
    try {
      const errorStore = useErrorStore();
      return await errorStore.retryAll();
    } catch (e) {
      // Store might not be available
      return false;
    }
  }

  /**
   * Type guard for Axios errors
   */
  private isAxiosError(error: unknown): error is AxiosError {
    return error !== null && typeof error === 'object' && 'isAxiosError' in error;
  }
}

// Create a singleton instance
const errorHandler = new ErrorHandler();
export default errorHandler;