/**
 * User Routes
 * Clean user routes using controller pattern with proper authentication
 */

import { Router } from 'express';
import { sessionGuard } from '../middleware/auth.middleware';
import { userController } from '../controllers/user.controller';
import { logger } from '@utils/logger';

// Create router
const router = Router();

logger.info('📄 User routes module loaded');

// =============================================================================
// PROFILE ROUTES - Current User
// =============================================================================

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user's profile (alias for /profile)
 * @access  Private (requires session authentication)
 */
router.get('/me', sessionGuard, userController.getProfile.bind(userController));

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user's profile
 * @access  Private (requires session authentication)
 */
router.get('/profile', sessionGuard, userController.getProfile.bind(userController));

// =============================================================================
// USER MANAGEMENT ROUTES - Admin Only
// =============================================================================

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (requires session authentication)
 */
router.get('/', sessionGuard, userController.getUsers.bind(userController));

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user
 * @access  Private (requires session authentication)
 */
router.post('/', sessionGuard, userController.createUser.bind(userController));

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (requires session authentication)
 */
router.get('/:id', sessionGuard, userController.getUserById.bind(userController));

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user by ID
 * @access  Private (requires session authentication)
 */
router.put('/:id', sessionGuard, userController.updateUser.bind(userController));

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user by ID
 * @access  Private (requires session authentication)
 */
router.delete('/:id', sessionGuard, userController.deleteUser.bind(userController));

export { router as userRouter };
logger.info('✅ User routes exported');
