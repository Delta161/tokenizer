/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

// External packages
import { Request, Response } from 'express';

// Internal modules
import { authService } from '@modules/accounts/services/auth.service';
import type { LoginCredentialsDTO, OAuthProfileDTO, RegisterDataDTO } from '@modules/accounts/types/auth.types';
import { clearTokenCookies, setTokenCookies } from '@modules/accounts/utils/jwt';
import { loginSchema, registerSchema } from '@modules/accounts/validators/auth.validators';
import { logger } from '@utils/logger';

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body) as RegisterDataDTO;

      // Register user
      const result = await authService.register(validatedData);

      // Set token cookies
      setTokenCookies(res, result.accessToken, result.refreshToken);

      // Return response
      res.status(201).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }

      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Login a user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body) as LoginCredentialsDTO;

      // Login user
      const result = await authService.login(validatedData);

      // Set token cookies
      setTokenCookies(res, result.accessToken, result.refreshToken);

      // Return response
      res.status(200).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }

      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // User is already attached to request by authGuard middleware
      const user = req.user;

      if (!user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      // Return user data
      res.status(200).json({ user });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      // Get token from request
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      // Verify token and get user
      const user = await authService.verifyToken(token);

      // Return user data
      res.status(200).json({ valid: true, user });
    } catch (error: any) {
      res.status(200).json({ valid: false, error: error.message });
    }
  }

  /**
   * Handle OAuth authentication success
   */
  async handleOAuthSuccess(req: Request, res: Response): Promise<void> {
    try {
      // User should be attached to request by Passport
      const profile = req.user as OAuthProfileDTO;
      
      if (!profile) {
        logger.error('OAuth authentication failed: No profile data');
        res.redirect('/auth/error?error=authentication_failed');
        return;
      }
      
      // Process OAuth login
      const result = await authService.processOAuthLogin(profile);
      
      // Set token cookies
      setTokenCookies(res, result.accessToken, result.refreshToken);
      
      // Redirect to frontend with success
      const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${redirectUrl}/auth/callback?success=true`);
    } catch (error: any) {
      logger.error('OAuth authentication error', { error: error.message });
      const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${redirectUrl}/auth/callback?error=${encodeURIComponent(error.message)}`);
    }
  }
  
  /**
   * Handle OAuth authentication error
   */
  async handleOAuthError(req: Request, res: Response): Promise<void> {
    const error = req.query.error || 'Unknown error';
    logger.error('OAuth error', { error });
    
    const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${redirectUrl}/auth/callback?error=${encodeURIComponent(error.toString())}`);
  }
  
  /**
   * Logout user
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Clear token cookies
      clearTokenCookies(res);
      
      // Return success response
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      logger.error('Logout error', { error: error.message });
      res.status(500).json({ error: 'Logout failed' });
    }
  }
  
  /**
   * Refresh access token using refresh token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Get refresh token from cookies
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        res.status(401).json({ error: 'No refresh token provided' });
        return;
      }
      
      // Verify token and get user
      const user = await authService.verifyToken(refreshToken);
      
      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = authService.generateTokens(user);
      
      // Set new token cookies
      setTokenCookies(res, accessToken, newRefreshToken);
      
      // Return success response
      res.status(200).json({ success: true, accessToken });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
  
  /**
   * Health check for auth service
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    const providers = [];
    
    // Check if Google OAuth is configured
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      providers.push('google');
    }
    
    // Check if Azure OAuth is configured
    if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
      providers.push('azure');
    }
    
    res.status(200).json({
      status: 'ok',
      providers,
      timestamp: new Date().toISOString()
    });
  }
}

// Create singleton instance
export const authController = new AuthController();