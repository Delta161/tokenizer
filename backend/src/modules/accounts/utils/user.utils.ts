/**
 * User Utilities
 * Helper functions for user-related operations
 */

// External packages
import type { User } from '@prisma/client';

// Internal modules
import type { UserDTO, UserPublicDTO } from '../types/user.types';

/**
 * Map Prisma User model to UserDTO
 * Removes sensitive fields like password
 * @param user Prisma User model
 * @returns User DTO without sensitive fields
 */
export const mapUserToDTO = (user: User): UserDTO => {
  // No password field in the User model, just return the user object
  const userDTO = user;
  
  return userDTO as UserDTO;
};

/**
 * Map Prisma User model to UserPublicDTO
 * Contains only public-facing fields
 * @param user Prisma User model
 * @returns User Public DTO with only public fields
 */
export const mapUserToPublicDTO = (user: User): UserPublicDTO => {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
};

/**
 * Generate a random password
 * @param length Password length (default: 12)
 * @returns Random password string
 */
export const generateRandomPassword = (length = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

/**
 * Format user's full name
 * @param firstName User's first name
 * @param lastName User's last name
 * @returns Formatted full name
 */
export const formatFullName = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) {
    return '';
  }
  
  return [firstName, lastName].filter(Boolean).join(' ');
};
