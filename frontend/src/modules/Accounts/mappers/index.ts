/**
 * Mappers Index
 * 
 * This file exports all mapper functions from the Accounts module.
 * It provides a centralized access point for data transformation utilities.
 */

// User mappers
export {
  mapBackendUserToFrontend,
  mapFrontendUserToBackend,
  mapBackendUsersToFrontend,
  mapFrontendProfileToBackend,
  mapBackendProfileToFrontend,
  mapFrontendSettingsToBackend,
  mapBackendSettingsToFrontend,
  mapRegisterDataToBackend,
  mapSearchParamsToBackend,
  mapBackendSearchResultToFrontend
} from './user.mapper';

// KYC mappers
export {
  mapBackendKycToFrontend,
  mapKycSubmissionToBackend,
  mapBackendSessionToFrontend,
  mapBackendKycArrayToFrontend,
  formatCountryName,
  formatDocumentType,
  isKycVerified,
  formatKycStatus
} from './kyc.mapper';

// Auth mappers
export {
  mapBackendAuthResponseToFrontend,
  mapLoginCredentialsToBackend,
  mapBackendTokenRefreshToFrontend
  // Password reset mapper functions removed - only OAuth authentication is supported
} from './auth.mapper';