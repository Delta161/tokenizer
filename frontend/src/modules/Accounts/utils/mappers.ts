/**
 * Data Mappers
 * 
 * Maps data between frontend and backend formats
 */

import type { User, UserProfile, KycData, AuthResponse, TokenRefreshResponse, LoginCredentials } from '../types/user.types';

// User mappers
export function mapBackendUserToFrontend(backendUser: any): User {
  return {
    id: backendUser.id,
    firstName: backendUser.firstName || backendUser.first_name,
    lastName: backendUser.lastName || backendUser.last_name,
    email: backendUser.email,
    role: backendUser.role,
    bio: backendUser.bio,
    location: backendUser.location,
    website: backendUser.website,
    socialLinks: backendUser.socialLinks || backendUser.social_links,
    createdAt: backendUser.createdAt || backendUser.created_at,
    updatedAt: backendUser.updatedAt || backendUser.updated_at,
    notifications: backendUser.notifications,
  };
}

export function mapFrontendUserToBackend(frontendUser: Partial<User>): any {
  return {
    firstName: frontendUser.firstName,
    lastName: frontendUser.lastName,
    email: frontendUser.email,
    bio: frontendUser.bio,
    location: frontendUser.location,
    website: frontendUser.website,
    socialLinks: frontendUser.socialLinks,
    notifications: frontendUser.notifications,
  };
}

export function mapBackendUsersToFrontend(backendUsers: any[]): User[] {
  return backendUsers.map(mapBackendUserToFrontend);
}

// Profile mappers
export function mapBackendProfileToFrontend(backendProfile: any): UserProfile {
  return mapBackendUserToFrontend(backendProfile) as UserProfile;
}

export function mapFrontendProfileToBackend(frontendProfile: Partial<UserProfile>): any {
  return mapFrontendUserToBackend(frontendProfile);
}

// Auth mappers
export function mapBackendAuthResponseToFrontend(backendResponse: any): AuthResponse {
  return {
    accessToken: backendResponse.accessToken || backendResponse.access_token,
    refreshToken: backendResponse.refreshToken || backendResponse.refresh_token,
    expiresAt: backendResponse.expiresAt || backendResponse.expires_at,
    user: mapBackendUserToFrontend(backendResponse.user),
  };
}

export function mapLoginCredentialsToBackend(credentials: LoginCredentials): any {
  return {
    email: credentials.email,
    password: credentials.password,
  };
}

export function mapBackendTokenRefreshToFrontend(backendResponse: any): TokenRefreshResponse {
  return {
    accessToken: backendResponse.accessToken || backendResponse.access_token,
    expiresAt: backendResponse.expiresAt || backendResponse.expires_at,
  };
}

// KYC mappers
export function mapBackendKycToFrontend(backendKyc: any): KycData {
  return {
    id: backendKyc.id,
    userId: backendKyc.userId || backendKyc.user_id,
    status: backendKyc.status,
    level: backendKyc.level,
    documents: backendKyc.documents || [],
    createdAt: backendKyc.createdAt || backendKyc.created_at,
    updatedAt: backendKyc.updatedAt || backendKyc.updated_at,
    verifiedAt: backendKyc.verifiedAt || backendKyc.verified_at,
    rejectedAt: backendKyc.rejectedAt || backendKyc.rejected_at,
    rejectionReason: backendKyc.rejectionReason || backendKyc.rejection_reason,
  };
}

export function mapKycSubmissionToBackend(frontendKyc: Partial<KycData>): any {
  return {
    level: frontendKyc.level,
    documents: frontendKyc.documents,
  };
}

export function mapBackendSessionToFrontend(backendSession: any): any {
  return {
    id: backendSession.id,
    status: backendSession.status,
    url: backendSession.url,
    expiresAt: backendSession.expiresAt || backendSession.expires_at,
  };
}

export function mapBackendKycArrayToFrontend(backendKycArray: any[]): KycData[] {
  return backendKycArray.map(mapBackendKycToFrontend);
}

export function isKycVerified(kyc: KycData): boolean {
  return kyc.status === 'verified';
}

// Search mappers
export function mapSearchParamsToBackend(params: any): any {
  return {
    page: params.page || 1,
    limit: params.limit || 10,
    search: params.search,
    role: params.role,
    status: params.status,
  };
}

export function mapBackendSearchResultToFrontend(backendResult: any): any {
  return {
    data: mapBackendUsersToFrontend(backendResult.data || []),
    total: backendResult.total || 0,
    page: backendResult.page || 1,
    limit: backendResult.limit || 10,
    totalPages: backendResult.totalPages || Math.ceil((backendResult.total || 0) / (backendResult.limit || 10)),
  };
}
