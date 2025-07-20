/**
 * User Utilities
 * Helper functions for user-related operations
 */
import type { User } from '@prisma/client';
import type { UserDTO } from '@modules/accounts/types/user.types';
/**
 * Map Prisma User model to UserDTO
 * Removes sensitive fields like password
 * @param user Prisma User model
 * @returns User DTO without sensitive fields
 */
export declare const mapUserToDTO: (user: User) => UserDTO;
/**
 * Generate a random password
 * @param length Password length (default: 12)
 * @returns Random password string
 */
export declare const generateRandomPassword: (length?: number) => string;
/**
 * Format user's full name
 * @param firstName User's first name
 * @param lastName User's last name
 * @returns Formatted full name
 */
export declare const formatFullName: (firstName?: string, lastName?: string) => string;
//# sourceMappingURL=user.utils.d.ts.map