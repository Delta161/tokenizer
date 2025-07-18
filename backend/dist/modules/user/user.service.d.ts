import { PrismaClient, UserRole } from '@prisma/client';
import { UpdateUserDTO, UserPublicDTO } from './user.types';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Get user profile by ID
     * Returns null if user doesn't exist or is soft deleted
     */
    getUserById(userId: string): Promise<UserPublicDTO | null>;
    /**
     * Get user profile by email
     * Returns null if user doesn't exist or is soft deleted
     */
    getUserByEmail(email: string): Promise<UserPublicDTO | null>;
    /**
     * Update user profile
     * Only allows updating specific fields, prevents role/provider changes
     */
    updateUser(userId: string, updateData: UpdateUserDTO): Promise<UserPublicDTO | null>;
    /**
     * Soft delete user account
     * Sets deletedAt timestamp instead of physically removing the record
     */
    deleteUser(userId: string): Promise<boolean>;
    /**
     * Check if user exists and is active (not soft deleted)
     */
    isUserActive(userId: string): Promise<boolean>;
    /**
     * Check if user has specific role
     */
    hasRole(userId: string, role: UserRole): Promise<boolean>;
    /**
     * Get all active users (admin only)
     * Returns users that are not soft deleted
     */
    getAllActiveUsers(limit?: number, offset?: number): Promise<UserPublicDTO[]>;
    /**
     * Get user count (admin only)
     */
    getUserCount(): Promise<number>;
}
//# sourceMappingURL=user.service.d.ts.map