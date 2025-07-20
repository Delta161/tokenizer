/**
 * User Module Types
 * Contains all DTOs and interfaces for the user module
 */
import { UserRole } from '../auth/auth.types';
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
 * Create user DTO
 */
export interface CreateUserDTO {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
}
/**
 * Update user DTO
 */
export interface UpdateUserDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: UserRole;
}
/**
 * Change password DTO
 */
export interface ChangePasswordDTO {
    currentPassword: string;
    newPassword: string;
}
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
export type UserSortField = 'firstName' | 'lastName' | 'email' | 'createdAt' | 'role';
/**
 * User sort options
 */
export interface UserSortOptions {
    field: UserSortField;
    direction: 'asc' | 'desc';
}
//# sourceMappingURL=user.types.d.ts.map