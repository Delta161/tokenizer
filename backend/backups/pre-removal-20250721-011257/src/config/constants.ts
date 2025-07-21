/**
 * Application Constants
 * Stores application-wide constants
 */

/**
 * API version
 */
export const API_VERSION = 'v1';

/**
 * API prefix
 */
export const API_PREFIX = `/api/${API_VERSION}`;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

/**
 * Rate limiting
 */
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // limit each IP to 100 requests per windowMs
};

/**
 * Security constants
 */
export const SECURITY = {
  BCRYPT_ROUNDS: 10,
  PASSWORD_RESET_EXPIRES: 60 * 60 * 1000, // 1 hour
};

/**
 * File upload constants
 */
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
};