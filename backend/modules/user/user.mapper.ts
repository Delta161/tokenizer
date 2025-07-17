import { User } from '@prisma/client';
import { UserPublicDTO } from './user.types';

/**
 * Maps a Prisma User model to a safe public DTO
 * Excludes sensitive fields like providerId and authProvider
 */
export const mapUserToPublicDTO = (user: User): UserPublicDTO => {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    phone: user.phone,
    timezone: user.timezone,
    preferredLanguage: user.preferredLanguage,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Maps an array of Prisma User models to public DTOs
 */
export const mapUsersToPublicDTOs = (users: User[]): UserPublicDTO[] => {
  return users.map(mapUserToPublicDTO);
};

/**
 * Checks if a user is soft deleted
 */
export const isUserDeleted = (user: User): boolean => {
  return user.deletedAt !== null;
};

/**
 * Filters out soft deleted users from an array
 */
export const filterActiveUsers = (users: User[]): User[] => {
  return users.filter(user => !isUserDeleted(user));
};