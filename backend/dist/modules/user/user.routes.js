import { Router } from 'express';
import { UserController } from './user.controller';
import { requireAuth } from '../auth/requireAuth';
import { requireAdmin } from '../auth/requireRole';
/**
 * User routes configuration
 * All routes require authentication via OAuth 2.0
 */
export const createUserRoutes = (prisma) => {
    const router = Router();
    const userController = new UserController(prisma);
    // Apply authentication middleware to all user routes
    router.use(requireAuth);
    /**
     * @route   GET /users/me
     * @desc    Get current user's profile
     * @access  Private (any authenticated user)
     * @returns UserProfileResponse
     */
    router.get('/me', userController.getCurrentUserProfile.bind(userController));
    /**
     * @route   PATCH /users/me
     * @desc    Update current user's profile
     * @access  Private (any authenticated user)
     * @body    UpdateUserRequest
     * @returns UpdateUserResponse
     */
    router.patch('/me', userController.updateCurrentUserProfile.bind(userController));
    /**
     * @route   DELETE /users/me
     * @desc    Soft delete current user's account
     * @access  Private (any authenticated user)
     * @returns DeleteUserResponse
     */
    router.delete('/me', userController.deleteCurrentUser.bind(userController));
    /**
     * @route   GET /users/:id
     * @desc    Get user profile by ID
     * @access  Private (Admin only)
     * @param   id - User UUID
     * @returns UserProfileResponse
     */
    router.get('/:id', requireAdmin, userController.getUserProfileById.bind(userController));
    /**
     * @route   GET /users
     * @desc    Get all users with pagination
     * @access  Private (Admin only)
     * @query   limit - Number of users to return (max 100, default 50)
     * @query   offset - Number of users to skip (default 0)
     * @returns Paginated list of users
     */
    router.get('/', requireAdmin, userController.getAllUsers.bind(userController));
    return router;
};
/**
 * Default export for convenience
 */
export default createUserRoutes;
//# sourceMappingURL=user.routes.js.map