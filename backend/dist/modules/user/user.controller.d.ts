import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/requireAuth';
import { UserProfileResponse, UpdateUserResponse, DeleteUserResponse, ErrorResponse } from './user.types';
import { PrismaClient } from '@prisma/client';
export declare class UserController {
    private userService;
    constructor(prisma: PrismaClient);
    /**
     * GET /users/me
     * Get current user's profile
     */
    getCurrentUserProfile: (req: AuthenticatedRequest, res: Response<UserProfileResponse | ErrorResponse>, next: NextFunction) => Promise<void>;
    /**
     * PATCH /users/me
     * Update current user's profile
     */
    updateCurrentUserProfile: (req: AuthenticatedRequest, res: Response<UpdateUserResponse | ErrorResponse>, next: NextFunction) => Promise<void>;
    /**
     * GET /users/:id
     * Get user profile by ID (Admin only)
     */
    getUserProfileById: (req: AuthenticatedRequest, res: Response<UserProfileResponse | ErrorResponse>, next: NextFunction) => Promise<void>;
    /**
     * DELETE /users/me
     * Soft delete current user's account
     */
    deleteCurrentUser: (req: AuthenticatedRequest, res: Response<DeleteUserResponse | ErrorResponse>, next: NextFunction) => Promise<void>;
    /**
     * GET /users
     * Get all users (Admin only) - Optional endpoint for future use
     */
    getAllUsers: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map