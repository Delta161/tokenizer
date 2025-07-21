/**
 * User Module Types
 * Contains all DTOs and interfaces for the user module
 */

// Internal modules
import type { UserRole } from './auth.types';

/**
 * User DTO interface
 */
// Import AuthProvider enum from Prisma client
import { AuthProvider } from '@prisma/client';

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  providerId: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  phone?: string;
  preferredLanguage?: string;
  role: UserRole;
  timezone?: string;
  authProvider: AuthProvider;
}

/**
 * User Public DTO interface
 * Used for public-facing user data
 */
export interface UserPublicDTO {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

/**
 * Create user DTO
 * Note: Password is optional as we only support OAuth authentication
 */
export interface CreateUserDTO {
  email: string;
  fullName: string;
  providerId: string;
  avatarUrl?: string;
  role?: UserRole;
  phone?: string;
  preferredLanguage?: string;
  timezone?: string;
  authProvider: AuthProvider;
}

/**
 * Update user DTO
 */
export interface UpdateUserDTO {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  phone?: string;
  preferredLanguage?: string;
  role?: UserRole;
  timezone?: string;
}

/**
 * Change password DTO removed - only OAuth authentication is supported
 */

/**
 * User filter options
 */
export interface UserFilterOptions {
  role?: UserRole;
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * User sort options
 */
export type UserSortField = 'fullName' | 'email' | 'createdAt' | 'role' | 'authProvider';

/**
 * User sort options
 */
export interface UserSortOptions {
  field: UserSortField;
  direction: 'asc' | 'desc';
}