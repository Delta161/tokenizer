/**
 * User Types
 * 
 * This file defines the types used in the User module.
 * Updated to match backend UserDTO structure.
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  authProvider?: string;
  providerId?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  phone?: string;
  preferredLanguage?: string;
  timezone?: string;
}

// Use same UserRole values as backend Prisma schema
export type UserRole = 'INVESTOR' | 'CLIENT' | 'ADMIN';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  phone?: string;
  preferredLanguage?: string;
  timezone?: string;
}

export interface UserSettings {
  id: string;
  email: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
  twoFactorEnabled: boolean;
}

export interface UserUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  twoFactorEnabled?: boolean;
}

export interface UserSearchParams {
  query?: string;
  role?: UserRole;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserSearchResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}