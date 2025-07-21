/**
 * User module type definitions
 */

/**
 * User interface
 * Represents a user in the system
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
  settings?: UserSettings;
}

/**
 * User role enum
 * Defines the possible roles a user can have
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  INVESTOR = 'INVESTOR'
}

/**
 * User profile interface
 * Contains additional user profile information
 */
export interface UserProfile {
  userId: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  bio?: string;
  company?: string;
  position?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

/**
 * User settings interface
 * Contains user preferences and settings
 */
export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  twoFactorEnabled: boolean;
  language: string;
  timezone: string;
}

/**
 * User update interface
 * Used when updating user information
 */
export interface UserUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  profile?: Partial<UserProfile>;
  settings?: Partial<UserSettings>;
}

/**
 * User search params interface
 * Used when searching for users
 */
export interface UserSearchParams {
  query?: string;
  role?: UserRole;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * User search result interface
 * Returned when searching for users
 */
export interface UserSearchResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}