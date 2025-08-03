/**
 * User Types
 * 
 * This file defines the types used in the User module.
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'user' | 'admin' | 'manager';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: UserRole;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
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