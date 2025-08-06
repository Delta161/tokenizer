/**
 * User Controller
 * Handles HTTP requests for user management
 */

// External packages
import { Request, Response, NextFunction } from 'express';

// Internal modules
import { PAGINATION } from '@config/constants';
import { userService } from '@modules/accounts/services/user.service';
import type { UserFilterOptions, UserSortOptions } from '@modules/accounts/types/user.types';
import { createPaginationResult, getSkipValue } from '@utils/pagination';
import { accountsLogger } from '@modules/accounts/utils/accounts.logger';
import { logger } from '@utils/logger';
import { 
  createUserSchema, 
  updateUserSchema, 
  userFilterSchema,
  userIdParamSchema
} from '@modules/accounts/validators/user.validator';

export class UserController {
  /**
   * Get all users
   */
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate and parse query parameters
      const validatedQuery = userFilterSchema.parse(req.query);
      
      // Get pagination parameters from req.pagination (set by paginationMiddleware)
      // or fall back to query parameters if middleware wasn't used
      const page = req.pagination?.page || Number(validatedQuery.page) || PAGINATION.DEFAULT_PAGE;
      const limit = req.pagination?.limit || Number(validatedQuery.limit) || PAGINATION.DEFAULT_LIMIT;
      const skip = req.pagination?.skip || getSkipValue(page, limit);
      
      // Extract filter parameters
      const filters: UserFilterOptions = {};
      if (validatedQuery.role) filters.role = validatedQuery.role;
      if (validatedQuery.search) filters.search = validatedQuery.search;
      if (validatedQuery.createdAfter) filters.createdAfter = new Date(validatedQuery.createdAfter);
      if (validatedQuery.createdBefore) filters.createdBefore = new Date(validatedQuery.createdBefore);
      
      // Extract sort parameters
      let sort: UserSortOptions | undefined;
      if (validatedQuery.sortBy) {
        sort = {
          field: validatedQuery.sortBy,
          direction: validatedQuery.sortDirection || 'asc'
        };
      }
      
      // Get users
      const { users, total } = await userService.getUsers(page, limit, filters, sort);
      
      // Create pagination result
      const result = createPaginationResult(users, total, { page, limit, skip });
      
      // Return response
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

    /**
   * Get current user profile
   * Requires authentication via authGuard middleware
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    const startTime = Date.now();
    
    try {
      // User is already attached to request by authGuard middleware
      const user = (req as any).user;

      if (!user) {
        const error = new Error('Authentication required');
        (error as any).status = 401;
        return next(error);
      }

      // Log profile access for security monitoring
      accountsLogger.info('User profile accessed', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Get complete user data from database
      const userData = await userService.getUserById(user.id);

      // Add performance metrics
      const processingTime = Date.now() - startTime;
      if (processingTime > 100) {
        logger.warn('Slow profile retrieval', { 
          userId: user.id, 
          processingTime 
        });
      }

      res.status(200).json({ 
        user: userData,
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      accountsLogger.logAccountError('profile_retrieval', 
        error instanceof Error ? error.message : 'Unknown error', 
        { 
          userId: (req as any).user?.id,
          processingTime: Date.now() - startTime 
        }
      );
      next(error);
    }
  }

  /**
   * Create a new user
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate and parse request body
      const validatedData = createUserSchema.parse(req.body);
      
      // Create user
      const user = await userService.createUser(validatedData);
      
      // Log user creation
      accountsLogger.logUserRegistration(user.id, user.email, 'manual_creation');
      logger.info(`User created: ${user.id}`, { userId: user.id, email: user.email });
      
      // Return response
      res.status(201).json({ user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      accountsLogger.logAccountError('user_creation', errorMessage, { data: req.body });
      next(error);
    }
  }

  /**
   * Update user
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if this is a profile request or a specific user request
      let userId: string;
      let isProfileUpdate = false;
      
      if (req.path === '/profile') {
        // For profile requests, use the authenticated user's ID
        userId = (req as any).user.id;
        isProfileUpdate = true;
      } else {
        // For specific user requests, validate and parse the user ID parameter
        const params = userIdParamSchema.parse(req.params);
        userId = params.userId;
      }
      
      // Validate and parse request body
      const validatedData = updateUserSchema.parse(req.body);
      
      // If this is a profile update (not admin), remove role from the update data
      if (isProfileUpdate && validatedData.role) {
        delete validatedData.role;
      }
      
      // Update user
      const user = await userService.updateUser(userId, validatedData);
      
      // Log user update
      const updatedFields = Object.keys(validatedData);
      accountsLogger.logUserProfileUpdate(userId, updatedFields);
      logger.info(`User updated: ${userId}`, { userId, updatedFields });
      
      // Return response
      res.status(200).json({ user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const contextUserId = req.path === '/profile' ? (req as any).user?.id : req.params.userId;
      accountsLogger.logAccountError('user_update', errorMessage, { userId: contextUserId, data: req.body });
      next(error);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate and parse user ID parameter
      const { userId } = userIdParamSchema.parse(req.params);
      
      // Get the admin/user who is performing the deletion
      const deletedBy = (req as any).user?.id || 'system';
      const reason = req.body.reason || 'not specified';
      
      // Delete user
      await userService.deleteUser(userId);
      
      // Log user deletion
      accountsLogger.logUserDeletion(userId, reason);
      logger.info(`User deleted: ${userId}`, { userId, deletedBy, reason });
      
      // Return response
      res.status(204).end();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      accountsLogger.logAccountError('user_deletion', errorMessage, { userId: req.params.userId });
      next(error);
    }
  }

  /** Get a specific user by ID (admin only) */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = userIdParamSchema.parse(req.params);
      const userId = params.userId;
      const user = await userService.getUserById(userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change user password
   */
  // changePassword method removed - only OAuth authentication is supported
}

// Create singleton instance
export const userController = new UserController();

