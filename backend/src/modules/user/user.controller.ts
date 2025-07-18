/**
 * User Controller
 * Handles HTTP requests for user management
 */

import { Request, Response } from 'express';
import { userService } from './user.service';
import { 
  createUserSchema, 
  updateUserSchema, 
  changePasswordSchema,
  userIdParamSchema,
  userFilterSchema
} from './user.validators';
import { UserFilterOptions, UserSortOptions } from './user.types';
import { PAGINATION } from '../../config/constants';
import { createPaginationResult } from '../../utils/pagination';

export class UserController {
  /**
   * Get all users
   */
  async getUsers(req: Request, res: Response): Promise<void> {
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
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: error.message || 'Failed to get users' });
      }
    }
  }

  /**
 * Get user by ID
 */
async getUserById(req: Request, res: Response): Promise<void> {
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
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else if (error.statusCode === 404) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Failed to get user' });
    }
  }
}

  /**
   * Create a new user
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      // Validate and parse request body
      const validatedData = createUserSchema.parse(req.body);
      
      // Create user
      const user = await userService.createUser(validatedData);
      
      // Return response
      res.status(201).json({ user });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error.statusCode === 400) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message || 'Failed to create user' });
      }
    }
  }

  /**
   * Update user
   */
  async updateUser(req: Request, res: Response): Promise<void> {
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
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error.statusCode === 404) {
        res.status(404).json({ error: error.message });
      } else if (error.statusCode === 400) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message || 'Failed to update user' });
      }
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      // Validate and parse user ID parameter
      const { userId } = userIdParamSchema.parse(req.params);
      
      // Delete user
      await userService.deleteUser(userId);
      
      // Return response
      res.status(204).end();
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error.statusCode === 404) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message || 'Failed to delete user' });
      }
    }
  }

  /**
   * Change user password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // Check if this is a profile request or a specific user request
      let userId: string;
      
      if (req.path === '/profile/change-password') {
        // For profile requests, use the authenticated user's ID
        userId = (req as any).user.id;
      } else {
        // For specific user requests, validate and parse the user ID parameter
        const params = userIdParamSchema.parse(req.params);
        userId = params.userId;
      }
      
      // Validate and parse request body
      const validatedData = changePasswordSchema.parse(req.body);
      
      // Change password
      await userService.changePassword(userId, validatedData);
      
      // Return response
      res.status(204).end();
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error.statusCode === 404) {
        res.status(404).json({ error: error.message });
      } else if (error.statusCode === 400) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message || 'Failed to change password' });
      }
    }
  }
}

// Create singleton instance
export const userController = new UserController();