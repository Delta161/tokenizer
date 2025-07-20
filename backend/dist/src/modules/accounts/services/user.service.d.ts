/**
 * User Service
 * Handles user-related business logic
 */
import { PrismaClient } from '@prisma/client';
import type { ChangePasswordDTO, CreateUserDTO, UpdateUserDTO, UserDTO, UserFilterOptions, UserSortOptions } from '@modules/accounts/types/user.types';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Get all users with pagination and filtering
     */
    getUsers(page?: number, limit?: number, filters?: UserFilterOptions, sort?: UserSortOptions): Promise<{
        users: UserDTO[];
        total: number;
    }>;
    /**
     * Get user by ID
     */
    getUserById(userId: string): Promise<UserDTO>;
    /**
     * Create a new user
     */
    createUser(data: CreateUserDTO): Promise<UserDTO>;
    /**
     * Update user
     */
    updateUser(userId: string, data: UpdateUserDTO): Promise<UserDTO>;
    /**
     * Delete user
     */
    deleteUser(userId: string): Promise<void>;
    /**
     * Change user password
     */
    changePassword(userId: string, data: ChangePasswordDTO): Promise<void>;
}
export declare const userService: UserService;
//# sourceMappingURL=user.service.d.ts.map