import { User, UserRole, AuthProvider } from '@prisma/client';
import { NormalizedProfile } from './oauthProfileMapper.js';
/**
 * User creation data interface
 */
export interface CreateUserData {
    email: string;
    fullName: string;
    authProvider: AuthProvider;
    providerId: string;
    avatarUrl?: string;
}
/**
 * Enhanced user interface with role information
 */
export interface UserWithRole extends User {
    role: UserRole;
}
/**
 * Find user by email
 */
export declare const findUserByEmail: (email: string) => Promise<UserWithRole | null>;
/**
 * Find user by provider ID
 */
export declare const findUserByProviderId: (providerId: string) => Promise<UserWithRole | null>;
/**
 * Create new user with auto-provisioning
 */
export declare const createUser: (userData: CreateUserData) => Promise<UserWithRole>;
/**
 * Find or create user (auto-provisioning logic)
 */
export declare const findOrCreateUser: (profile: NormalizedProfile) => Promise<UserWithRole>;
/**
 * Update user's last login timestamp and metadata
 */
export declare const updateUserLoginMetadata: (userId: string, metadata: {
    ipAddress?: string;
    userAgent?: string;
    provider: string;
}) => Promise<void>;
/**
 * Get user by ID with role information
 */
export declare const getUserById: (userId: string) => Promise<UserWithRole | null>;
/**
 * Clean up expired sessions (utility function)
 */
export declare const cleanupExpiredSessions: () => Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map