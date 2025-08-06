/**
 * Accounts Module Services Index
 * Exports all services for the accounts module
 */

// Authentication service
export * from './auth.service';

// User profile service
export * from './profile.service';

// Admin service
export * from './admin.service';

// User service (legacy - gradually being replaced by profile and admin services)
export * from './user.service';

// KYC service
export * from './kyc.service';
