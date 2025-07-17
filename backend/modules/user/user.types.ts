import { UserRole, AuthProvider } from '@prisma/client';

// Public DTO for user profile (safe for external consumption)
export interface UserPublicDTO {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  phone: string | null;
  timezone: string | null;
  preferredLanguage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for updating user profile
export interface UpdateUserDTO {
  fullName?: string;
  avatarUrl?: string | null;
  phone?: string | null;
  timezone?: string | null;
  preferredLanguage?: string | null;
}

// Request interfaces
export interface UpdateUserRequest {
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  timezone?: string;
  preferredLanguage?: string;
}

export interface GetUserByIdRequest {
  id: string;
}

// Response interfaces
export interface UserProfileResponse {
  success: boolean;
  data: UserPublicDTO;
}

export interface UpdateUserResponse {
  success: boolean;
  data: UserPublicDTO;
  message: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

// Type guards
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

export function isValidAuthProvider(provider: string): provider is AuthProvider {
  return Object.values(AuthProvider).includes(provider as AuthProvider);
}