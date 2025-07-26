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
} from './userMapper';

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
} from './kycMapper';

// Auth mappers
export {
  mapBackendAuthResponseToFrontend,
  mapLoginCredentialsToBackend,
  mapBackendTokenRefreshToFrontend,
  mapPasswordResetRequestToBackend,
  mapPasswordResetConfirmToBackend
} from './authMapper';