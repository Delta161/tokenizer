/**
 * Auth Module Types
 * Contains all DTOs and interfaces for the auth module
 */

/**
 * User roles enum
 */
export enum UserRole {
  USER = 'USER',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
  INVESTOR = 'INVESTOR'
}

/**
 * User DTO interface
 */
export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Login credentials DTO
 */
export interface LoginCredentialsDTO {
  email: string;
  password: string;
}

/**
 * Register data DTO
 */
export interface RegisterDataDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

/**
 * Auth response DTO
 */
export interface AuthResponseDTO {
  user: UserDTO;
  token: string;
}

/**
 * OAuth profile DTO
 */
export interface OAuthProfileDTO {
  id: string;
  displayName?: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  emails?: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
  provider: string;
}