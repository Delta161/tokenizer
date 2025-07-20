/**
 * User Routes
 * Defines all routes for user management
 */
// External packages
import { Router } from 'express';
// Internal modules
import { userController } from '@modules/accounts/controllers/user.controller';
import { authGuard, roleGuard } from '@modules/accounts/middleware/auth.middleware';
// Create router
const router = Router();
/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Authenticated user
 */
router.get('/profile', authGuard, userController.getUserById);
/**
 * @route   PATCH /api/users/profile
 * @desc    Update current user's profile
 * @access  Authenticated user
 */
router.patch('/profile', authGuard, userController.updateUser);
/**
 * @route   POST /api/users/profile/change-password
 * @desc    Change current user's password
 * @access  Authenticated user
 */
router.post('/profile/change-password', authGuard, userController.changePassword);
/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filtering
 * @access  Admin only
 */
router.get('/', authGuard, roleGuard(UserRole.ADMIN), userController.getUsers);
/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Admin only
 */
router.post('/', authGuard, roleGuard(UserRole.ADMIN), userController.createUser);
/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Admin only
 */
router.get('/:userId', authGuard, roleGuard(UserRole.ADMIN), userController.getUserById);
/**
 * @route   PATCH /api/users/:userId
 * @desc    Update user
 * @access  Admin only
 */
router.patch('/:userId', authGuard, roleGuard(UserRole.ADMIN), userController.updateUser);
/**
 * @route   DELETE /api/users/:userId
 * @desc    Delete user
 * @access  Admin only
 */
router.delete('/:userId', authGuard, roleGuard(UserRole.ADMIN), userController.deleteUser);
/**
 * @route   POST /api/users/:userId/change-password
 * @desc    Change user password
 * @access  Admin only
 */
router.post('/:userId/change-password', authGuard, roleGuard(UserRole.ADMIN), userController.changePassword);
export const userRouter = router;
//# sourceMappingURL=user.routes.js.map