/**
 * Error response type for API responses
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

/**
 * Create an error response object
 * @param error Error type
 * @param message Error message
 * @returns Error response object
 */
export const createErrorResponse = (error: string, message: string): ErrorResponse => ({
  success: false,
  error,
  message
});