/**
 * Auth Types
 * Defines types for the auth module
 */

export enum UserRole {
  USER = 'USER',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
  INVESTOR = 'INVESTOR'
}

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

export interface LoginCredentialsDTO {
  email: string;
  password: string;
}

export interface RegisterDataDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

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