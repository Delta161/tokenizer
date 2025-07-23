/**
 * Error response type for API responses
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

// Export a concrete implementation to ensure it's available at runtime
export const createErrorResponse = (error: string, message: string): ErrorResponse => ({
  success: false,
  error,
  message
});