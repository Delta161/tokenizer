/**
 * User Controller
 * Handles HTTP requests for user management operations
 * Implements CRUD operations for user resources
 */

// External packages
import { Request, Response } from 'express';

// Internal modules
import { PAGINATION } from '@config/constants';
import { userService } from '@modules/accounts/services/user.service';
import type { UserFilterOptions, UserSortOptions, CreateUserDTO, UpdateUserDTO } from '@modules/accounts/types/user.types';
import { createPaginationResult, getSkipValue } from '@utils/pagination';
import { accountsLogger } from '@modules/accounts/utils/accounts.logger';
import { logger } from '@utils/logger';
import { handleControllerError } from '@utils/error';
import { createSuccessResponse, createPaginatedResponse } from '@modules/accounts/utils/response-formatter';
import { 
  createUserSchema, 
  updateUserSchema, 
  userFilterSchema,
  userIdParamSchema
} from '@modules/accounts/validators/user.validator';
import { 
  measurePerformance, 
  OperationCategory 
} from '@modules/accounts/utils/performance-monitor.util';

/**
 * Controller for managing user resources
 * Provides endpoints for user listing, creation, updates, and deletion
 */
export class UserController {

  /**
   * Creates a new UserController instance
   * UserService now includes ProfileService functionality
   */
  constructor() {
    // UserService now includes ProfileService functionality
  }

  /**
   * Gets a paginated list of users with optional filtering and sorting
   * 
   * @param req - Express request object with query parameters for filtering and pagination
   * @param res - Express response object
   * @returns Paginated response with user data or error response
   * @throws HttpError if user retrieval fails
   */
  async getUsers(req: Request, res: Response): Promise<Response | void> {
    try {
      return await measurePerformance(
        'getUsers',
        OperationCategory.DATABASE_READ,
        async () => {
          // Validate and parse query parameters
          const validationStart = Date.now();
          const validatedQuery = userFilterSchema.parse(req.query);
          const validationTime = Date.now() - validationStart;
          
          if (validationTime > 50) {
            logger.debug('Slow query validation', { 
              validationTime,
              method: 'getUsers'
            });
          }
          
          // Get pagination parameters from req.pagination (set by paginationMiddleware)
          // or fall back to query parameters if middleware wasn't used
          const page = req.pagination?.page ?? Number(validatedQuery.page) ?? PAGINATION.DEFAULT_PAGE;
          const limit = req.pagination?.limit ?? Number(validatedQuery.limit) ?? PAGINATION.DEFAULT_LIMIT;
          const skip = req.pagination?.skip ?? getSkipValue(page, limit);
          
          // Extract filter parameters
          const filters: UserFilterOptions = {};
          if (validatedQuery.role) {
            filters.role = validatedQuery.role;
          }
          if (validatedQuery.search) {
            filters.search = validatedQuery.search;
          }
          if (validatedQuery.createdAfter) {
            filters.createdAfter = new Date(validatedQuery.createdAfter);
          }
          if (validatedQuery.createdBefore) {
            filters.createdBefore = new Date(validatedQuery.createdBefore);
          }
          
          // Extract sort parameters
          let sort: UserSortOptions | undefined;
          if (validatedQuery.sortBy) {
            sort = {
              field: validatedQuery.sortBy,
              direction: validatedQuery.sortDirection || 'asc'
            };
          }
          
          // Get users using user service
          const queryStart = Date.now();
          const { users, total } = await userService.getUsers(page, limit, filters, sort);
          const queryTime = Date.now() - queryStart;
          
          if (queryTime > 300) {
            logger.warn('Slow user query', { 
              queryTime,
              filters,
              sort,
              page,
              limit,
              resultCount: users.length
            });
          }
          
          // Create pagination result
          const paginatedResult = createPaginationResult(users, total, { page, limit, skip });
          
          // Return standardized response
          return res.status(200).json(createPaginatedResponse(
            paginatedResult.data,
            'Users retrieved successfully',
            paginatedResult.meta
          ));
        },
        {
          userCount: req.query.limit, 
          filters: JSON.stringify(req.query)
        }
      );
    } catch (error) {
      // Use standardized error handler
      return handleControllerError(error, req, res, 'List users');
    }
  }

    /**
   * Retrieves the profile of the currently authenticated user
   * Requires prior authentication via authGuard middleware
   * 
   * @param req - Express request object with user attached from authGuard
   * @param res - Express response object
   * @returns Response with user profile data or error response
   * @throws HttpError with 401 status if authentication is missing
   */
  async getProfile(req: Request, res: Response): Promise<Response | void> {
    try {
      return await measurePerformance(
        'getProfile',
        OperationCategory.DATABASE_READ,
        async () => {
          // User is already attached to request by authGuard middleware
          const user = (req as any).user;

          if (!user) {
            const error = new Error('Authentication required');
            (error as any).status = 401;
            throw error;
          }

          // Log profile access for security monitoring
          accountsLogger.info('User profile accessed', {
            userId: user.id,
            email: user.email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          });

          // Get complete user profile using profile service
          const userData = await userService.getProfile(user.id);

          // Return standardized response
          return res.status(200).json(createSuccessResponse(
            userData,
            'Profile retrieved successfully'
          ));
        },
        {
          userId: (req as any).user?.id,
          ip: req.ip,
          path: req.path
        }
      );
    } catch (error) {
      // Use standardized error handler
      return handleControllerError(error, req, res, 'Get user profile');
    }
  }

  /**
   * Creates a new user in the system
   * Validates input data and creates a user record with specified attributes
   * 
   * @param req - Express request object containing user creation data in the body
   * @param res - Express response object
   * @returns Response with created user data or error response
   * @throws HttpError if validation fails or user creation fails
   */
  async createUser(req: Request, res: Response): Promise<Response | void> {
    try {
      return await measurePerformance(
        'createUser',
        OperationCategory.DATABASE_WRITE,
        async () => {
          // Validate and parse request body
          const validatedData = createUserSchema.parse(req.body);
          
          // Handle null avatarUrl - transform to undefined to match CreateUserDTO
          const userData = { ...validatedData };
          if (userData.avatarUrl === null) {
            userData.avatarUrl = undefined;
          }
          
          // Create user using user service with type assertion to CreateUserDTO
          const user = await userService.createUser(userData as CreateUserDTO);
          
          // Log user creation
          accountsLogger.logUserRegistration(user.id, user.email, 'manual_creation');
          logger.info(`User created: ${user.id}`, { userId: user.id, email: user.email });
          
          // Return standardized response
          return res.status(201).json({
            success: true,
            data: user,
            message: 'User created successfully',
            meta: {
              timestamp: new Date().toISOString()
            }
          });
        },
        {
          email: req.body.email,
          role: req.body.role,
          source: 'api'
        }
      );
    } catch (error) {
      // Use standardized error handler
      return handleControllerError(error, req, res, 'Create user');
    }
  }

  /**
   * Updates a user's information or the current user's profile
   * Handles both admin updates to any user and self-updates to profile
   * 
   * @param req - Express request object containing update data and optional userId
   * @param res - Express response object
   * @returns Response with updated user data or error response
   * @throws HttpError if validation fails or user update fails
   */
  async updateUser(req: Request, res: Response): Promise<Response | void> {
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
      
      return await measurePerformance(
        isProfileUpdate ? 'updateProfile' : 'updateUser',
        OperationCategory.DATABASE_WRITE,
        async () => {
          // Validate and parse request body
          const validatedData = updateUserSchema.parse(req.body);
          
          // Handle null avatarUrl - transform to undefined to match UpdateUserDTO
          const userData = { ...validatedData };
          if (userData.avatarUrl === null) {
            userData.avatarUrl = undefined;
          }
          
          // If this is a profile update (not admin), remove role from the update data
          if (isProfileUpdate && userData.role) {
            delete userData.role;
          }
          
          // Update user using appropriate service
          let user;
          if (isProfileUpdate) {
            // Use UserService for self-profile updates
            user = await userService.updateProfile(userId, userData as UpdateUserDTO);
          } else {
            // Use UserService for user updates
            user = await userService.updateUser(userId, userData as UpdateUserDTO);
          }
          
          // Log user update
          const updatedFields = Object.keys(userData);
          accountsLogger.logUserProfileUpdate(userId, updatedFields);
          logger.info(`User updated: ${userId}`, { userId, updatedFields });
          
          // Return standardized response
          return res.status(200).json({
            success: true,
            data: user,
            message: 'User updated successfully',
            meta: {
              timestamp: new Date().toISOString()
            }
          });
        },
        {
          userId,
          isProfileUpdate,
          updatedFields: Object.keys(req.body),
          path: req.path
        }
      );
    } catch (error) {
      // Use standardized error handler
      return handleControllerError(error, req, res, 'Update user');
    }
  }

  /**
   * Deletes a user from the system
   * Records deletion event with reason and deleter information
   * 
   * @param req - Express request object containing userId parameter and optional reason
   * @param res - Express response object
   * @returns Response with deletion confirmation or error response
   * @throws HttpError if validation fails or user deletion fails
   */
  async deleteUser(req: Request, res: Response): Promise<Response | void> {
    try {
      // Validate and parse user ID parameter
      const { userId } = userIdParamSchema.parse(req.params);
      
      // Get the admin/user who is performing the deletion
      const deletedBy = (req as any).user?.id ?? 'system';
      const reason = req.body.reason ?? 'not specified';
      
      return await measurePerformance(
        'deleteUser',
        OperationCategory.DATABASE_WRITE,
        async () => {
          // Delete user using user service
          await userService.deleteUser(userId);
          
          // Log user deletion
          accountsLogger.logUserDeletion(userId, reason);
          logger.info(`User deleted: ${userId}`, { userId, deletedBy, reason });
          
          // Return standardized response for deletion
          // For 204 responses, we could either:
          // 1. Use 204 with no content (standard REST practice)
          // 2. Use 200 with success message (more informative)
          // Using option 2 for consistency with other responses
          return res.status(200).json({
            success: true,
            data: null,
            message: 'User deleted successfully',
            meta: {
              timestamp: new Date().toISOString()
            }
          });
        },
        {
          userId,
          deletedBy,
          reason
        }
      );
    } catch (error) {
      // Use standardized error handler
      return handleControllerError(error, req, res, 'Delete user');
    }
  }

  /**
   * Retrieves a specific user by their ID (admin only)
   * Fetches complete user profile including associated data
   * 
   * @param req - Express request object containing the userId parameter
   * @param res - Express response object
   * @returns Response with user data or error response
   * @throws HttpError if user is not found or retrieval fails
   */
  async getUserById(req: Request, res: Response): Promise<Response | void> {
    try {
      const params = userIdParamSchema.parse(req.params);
      const userId = params.userId;
      
      return await measurePerformance(
        'getUserById',
        OperationCategory.DATABASE_READ,
        async () => {
          // Get user using profile service
          const user = await userService.getProfile(userId);
          return res.status(200).json({ user });
        },
        {
          userId,
          adminId: (req as any).user?.id,
          source: 'admin'
        }
      );
    } catch (error) {
      // Use standardized error handler
      return handleControllerError(error, req, res, 'Get user by ID');
    }
  }

  /**
   * OAuth-only authentication - no credential management needed
   */
  // Authentication methods removed - only OAuth authentication is supported
}

// Create singleton instance
export const userController = new UserController();

