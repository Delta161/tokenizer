import { UserService } from './user.service';
import { validateUpdateUserInput, validateUserIdParam } from './validators/updateUserSchema';
export class UserController {
    userService;
    constructor(prisma) {
        this.userService = new UserService(prisma);
    }
    /**
     * GET /users/me
     * Get current user's profile
     */
    getCurrentUserProfile = async (req, res, next) => {
        try {
            // User is guaranteed to exist due to requireAuth middleware
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
                return;
            }
            const userProfile = await this.userService.getUserById(req.user.id);
            if (!userProfile) {
                res.status(404).json({
                    success: false,
                    error: 'User not found',
                    message: 'User profile not found or has been deleted'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: userProfile
            });
        }
        catch (error) {
            console.error('Error fetching current user profile:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to fetch user profile'
            });
        }
    };
    /**
     * PATCH /users/me
     * Update current user's profile
     */
    updateCurrentUserProfile = async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
                return;
            }
            // Validate request body
            const validation = validateUpdateUserInput(req.body);
            if (!validation.success) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    message: validation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
                });
                return;
            }
            const updateData = validation.data;
            // Check if there's actually data to update
            if (Object.keys(updateData).length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'No data provided',
                    message: 'No valid fields provided for update'
                });
                return;
            }
            const updatedProfile = await this.userService.updateUser(req.user.id, updateData);
            if (!updatedProfile) {
                res.status(404).json({
                    success: false,
                    error: 'User not found',
                    message: 'User profile not found or has been deleted'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: updatedProfile,
                message: 'Profile updated successfully'
            });
        }
        catch (error) {
            console.error('Error updating user profile:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to update user profile'
            });
        }
    };
    /**
     * GET /users/:id
     * Get user profile by ID (Admin only)
     */
    getUserProfileById = async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
                return;
            }
            // Validate user ID parameter
            const paramValidation = validateUserIdParam(req.params);
            if (!paramValidation.success) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid user ID',
                    message: 'User ID must be a valid UUID'
                });
                return;
            }
            const { id } = paramValidation.data;
            const userProfile = await this.userService.getUserById(id);
            if (!userProfile) {
                res.status(404).json({
                    success: false,
                    error: 'User not found',
                    message: 'User profile not found or has been deleted'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: userProfile
            });
        }
        catch (error) {
            console.error('Error fetching user profile by ID:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to fetch user profile'
            });
        }
    };
    /**
     * DELETE /users/me
     * Soft delete current user's account
     */
    deleteCurrentUser = async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
                return;
            }
            const deleted = await this.userService.deleteUser(req.user.id);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    error: 'User not found',
                    message: 'User account not found or already deleted'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'User account has been successfully deleted'
            });
        }
        catch (error) {
            console.error('Error deleting user account:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to delete user account'
            });
        }
    };
    /**
     * GET /users
     * Get all users (Admin only) - Optional endpoint for future use
     */
    getAllUsers = async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
                return;
            }
            // Parse query parameters for pagination
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);
            const offset = Math.max(parseInt(req.query.offset) || 0, 0);
            const users = await this.userService.getAllActiveUsers(limit, offset);
            const totalCount = await this.userService.getUserCount();
            res.status(200).json({
                success: true,
                data: users,
                pagination: {
                    limit,
                    offset,
                    total: totalCount,
                    hasMore: offset + limit < totalCount
                }
            });
        }
        catch (error) {
            console.error('Error fetching all users:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to fetch users'
            });
        }
    };
}
//# sourceMappingURL=user.controller.js.map