import { User } from '@prisma/client';
import { UserPublicDTO } from './user.types';
/**
 * Maps a Prisma User model to a safe public DTO
 * Excludes sensitive fields like providerId and authProvider
 */
export declare const mapUserToPublicDTO: (user: User) => UserPublicDTO;
/**
 * Maps an array of Prisma User models to public DTOs
 */
export declare const mapUsersToPublicDTOs: (users: User[]) => UserPublicDTO[];
/**
 * Checks if a user is soft deleted
 */
export declare const isUserDeleted: (user: User) => boolean;
/**
 * Filters out soft deleted users from an array
 */
export declare const filterActiveUsers: (users: User[]) => User[];
//# sourceMappingURL=user.mapper.d.ts.map