/**
 * Auth Types
 * Defines types for the auth module
 */

// Import UserRole from Prisma client to ensure consistency
import { UserRole } from '@prisma/client';
export { UserRole };

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  authProvider?: string;
  providerId?: string;
  avatarUrl?: string;
  lastLoginAt?: Date;
}

// Login credentials and register data DTOs removed - only OAuth authentication is supported

export interface AuthResponseDTO {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface OAuthProfileDTO {
  provider: string;
  id: string;
  displayName?: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  emails?: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
  _json?: any;
}

export interface NormalizedProfile {
  provider: string;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  role?: UserRole;
}

export interface GoogleProfile {
  id: string;
  displayName: string;
  name: { givenName: string; familyName: string };
  emails: Array<{ value: string; verified: boolean }>;
  photos: Array<{ value: string }>;
  provider: string;
  _json: any;
}


export interface AzureProfile {
  oid: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
  userPrincipalName?: string;
  mail?: string;
  provider: string;
  _json: any;
}
