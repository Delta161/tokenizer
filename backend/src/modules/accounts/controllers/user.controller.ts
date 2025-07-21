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
import { createPaginationResult } from '@utils/pagination';
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
      
      // Extract pagination parameters
      const page = Number(validatedQuery.page) || PAGINATION.DEFAULT_PAGE;
      const limit = Number(validatedQuery.limit) || PAGINATION.DEFAULT_LIMIT;
      
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
      const result = createPaginationResult(users, total, { page, limit, skip: (page - 1) * limit });
      
      // Return response
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
 * Get user by ID
 */
async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Check if this is a profile request or a specific user request
    let userId: string;
    
    if (req.path === '/profile') {
      // For profile requests, use the authenticated user's ID
      userId = (req as any).user.id;
    } else {
      // For specific user requests, validate and parse the user ID parameter
      const params = userIdParamSchema.parse(req.params);
      userId = params.userId;
    }
    
    // Get user
    const user = await userService.getUserById(userId);
    
    // Return response
    res.status(200).json({ user });
  } catch (error) {
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
      
      // Return response
      res.status(201).json({ user });
    } catch (error) {
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
      
      if (req.path === '/profile') {
        // For profile requests, use the authenticated user's ID
        userId = (req as any).user.id;
      } else {
        // For specific user requests, validate and parse the user ID parameter
        const params = userIdParamSchema.parse(req.params);
        userId = params.userId;
      }
      
      // Validate and parse request body
      const validatedData = updateUserSchema.parse(req.body);
      
      // If this is a profile update (not admin), remove role from the update data
      if (req.path === '/profile' && validatedData.role) {
        delete validatedData.role;
      }
      
      // Update user
      const user = await userService.updateUser(userId, validatedData);
      
      // Return response
      res.status(200).json({ user });
    } catch (error) {
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
      
      // Delete user
      await userService.deleteUser(userId);
      
      // Return response
      res.status(204).end();
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

