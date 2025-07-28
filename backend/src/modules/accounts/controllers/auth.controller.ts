/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

// External packages
import { Request, Response, NextFunction } from 'express';

// Internal modules
import { authService } from '@modules/accounts/services/auth.service';
import type { OAuthProfileDTO } from '@modules/accounts/types/auth.types';
import { clearTokenCookies, setTokenCookies } from '@modules/accounts/utils/jwt';
import { logger } from '@utils/logger';
import { accountsLogger } from '@modules/accounts/utils/accounts.logger';
import { createUnauthorized } from '@middleware/errorHandler';

export class AuthController {
  /**
   * Register and login methods removed - only OAuth authentication is supported
   */

  /**
   * Get user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User is already attached to request by authGuard middleware
      const user = req.user;

      if (!user) {
        return next(createUnauthorized('Not authenticated'));
      }

      // Return user data
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get token from request
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(createUnauthorized('No token provided'));
      }

      // Verify token and get user
      const user = await authService.verifyToken(token);

      // Return user data
      res.status(200).json({ valid: true, user });
    } catch (error) {
      // Special case for token verification - we want to return valid: false instead of an error
      res.status(200).json({ valid: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Handle OAuth authentication success
   */
  async handleOAuthSuccess(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      // User should be attached to request by Passport
      const profile = req.user as OAuthProfileDTO;
      
      if (!profile) {
        logger.error('OAuth authentication failed: No profile data');
        accountsLogger.logAuthError('unknown', 'No profile data', profile?.provider || 'oauth');
        res.redirect(`${process.env.AUTH_ERROR_PATH || '/auth/error'}?error=authentication_failed`);
        return;
      }
      
      // Process OAuth login
      const result = await authService.processOAuthLogin(profile);
      
      // Set token cookies
      setTokenCookies(res, result.accessToken, result.refreshToken);
      
      // Log successful login
      accountsLogger.logUserLogin(result.user.id, result.user.email, profile.provider);
      
      // Redirect to frontend with success
      const redirectUrl = process.env.FRONTEND_URL;
      res.redirect(`${redirectUrl}/auth/callback?success=true`);
    } catch (error) {
      // Special case for OAuth - we want to redirect with error instead of using next(error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('OAuth authentication error', { error: errorMessage });
      accountsLogger.logAuthError('unknown', errorMessage, 'oauth');
      
      const redirectUrl = process.env.FRONTEND_URL;
      res.redirect(`${redirectUrl}/auth/callback?error=${encodeURIComponent(errorMessage)}`);
    }
  }
  
  /**
   * Handle OAuth authentication error
   */
  async handleOAuthError(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const error = req.query.error || 'Unknown error';
    const provider = req.query.provider || 'unknown';
    const email = req.query.email || 'unknown';
    
    logger.error('OAuth error', { error, provider });
    accountsLogger.logAuthError(email.toString(), error.toString(), provider.toString());
    
    const redirectUrl = process.env.FRONTEND_URL;
    res.redirect(`${redirectUrl}/auth/callback?error=${encodeURIComponent(error.toString())}`);
  }
  
  /**
   * Logout user
   */
  async logout(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      // Get user ID from request if available
      const userId = req.user?.id;
      
      // Clear token cookies
      clearTokenCookies(res);
      
      // Log logout if user was authenticated
      if (userId) {
        accountsLogger.logUserLogout(userId);
      }
      
      // Return success response
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      _next(error);
    }
  }
  
  /**
   * Refresh access token using refresh token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get refresh token from cookies
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        accountsLogger.logAccountError('token_refresh', 'No refresh token provided', { ip: req.ip });
        return next(createUnauthorized('No refresh token provided'));
      }
      
      // Verify token and get user
      const user = await authService.verifyToken(refreshToken);
      
      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = authService.generateTokens(user);
      
      // Set new token cookies
      setTokenCookies(res, accessToken, newRefreshToken);
      
      // Log token refresh
      logger.debug('Token refreshed successfully', { userId: user.id });
      
      // Return success response
      res.status(200).json({ success: true, accessToken });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      accountsLogger.logAccountError('token_refresh', errorMessage, { ip: req.ip });
      next(error);
    }
  }
  
  /**
   * Health check for auth service
   */
  async healthCheck(req: Request, res: Response, _next: NextFunction): Promise<void> {
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

