/**
 * Global Middleware Index
 * Exports all middleware functions
 */

// Authentication middleware
// Export session middleware instead of auth middleware
export * from '../modules/accounts/middleware/session.middleware';

// KYC middleware
export * from '../modules/accounts/middleware/kyc.middleware';

// Error handling middleware
export * from './errorHandler';

// Validation middleware
export * from './validation.middleware';