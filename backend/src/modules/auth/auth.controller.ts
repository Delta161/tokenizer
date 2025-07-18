/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

import { Request, Response } from 'express';
import { authService } from './auth.service';
import { loginSchema, registerSchema } from './auth.validators';

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);

      // Register user
      const result = await authService.register(validatedData);

      // Return response
      res.status(201).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(400).json({ error: error.message || 'Failed to register user' });
      }
    }
  }

  /**
   * Login a user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);

      // Login user
      const result = await authService.login(validatedData);

      // Return response
      res.status(200).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(401).json({ error: error.message || 'Authentication failed' });
      }
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // User is attached to request by auth middleware
      const user = req.user;

      if (!user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      // Return user profile
      res.status(200).json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get user profile' });
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      // Verify token
      const user = await authService.verifyToken(token);

      // Return user
      res.status(200).json({ user });
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Invalid token' });
    }
  }
}

// Create singleton instance
export const authController = new AuthController();