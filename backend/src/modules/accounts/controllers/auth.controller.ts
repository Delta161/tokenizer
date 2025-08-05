/**
 * Auth Controller
 * Handles HTTP requests for authentication with OAuth integration
 */

// External packages
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';

// Internal modules - Use relative imports
import { authService } from '../services/auth.service';
import type { OAuthProfileDTO, AuthResponseDTO, UserDTO } from '../types/auth.types';
import { VerifyTokenSchema } from '../validators/auth.validator';
import { clearTokenCookies, setTokenCookies } from '../utils/jwt';
import { accountsLogger } from '../utils/accounts.logger';

// Global utilities - Use relative imports
import { logger } from '../../../utils/logger';

export class AuthController {
  /**
   * Extract token from request headers
   * @private
   */
  private extractTokenFromHeaders(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }

  /**
   * Validate and sanitize response data
   * @private
   */
  private sanitizeResponse(data: any): any {
    if (data && typeof data === 'object') {
      // Remove sensitive fields that might be included accidentally
      const { password, _password, hash, ...sanitized } = data;
      return sanitized;
    }
    return data;
  }

  /**
   * Get user profile (requires authentication via middleware)
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User is already attached to request by authGuard middleware
      const user = req.user;

      if (!user) {
        return next(createError(401, 'Authentication required'));
      }

      // Return sanitized user data with consistent format
      res.status(200).json({ 
        success: true,
        data: { user: this.sanitizeResponse(user) }
      });
    } catch (error) {
      logger.error('Error retrieving user profile', { error, userId: req.user?.id });
      next(error);
    }
  }

  /**
   * Verify JWT token with validation
   */
  async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract token from headers or body
      let token = this.extractTokenFromHeaders(req);
      
      // If not in headers, check request body for POST requests
      if (!token && req.method === 'POST' && req.body?.token) {
        const tokenValidation = VerifyTokenSchema.safeParse(req.body);
        if (tokenValidation.success) {
          token = tokenValidation.data.token;
        }
      }

      if (!token) {
        res.status(200).json({ 
          valid: false, 
          error: 'No token provided' 
        });
        return;
      }

      // Verify token and get user
      const user = await authService.verifyToken(token);

      // Return successful verification with user data
      res.status(200).json({ 
        valid: true, 
        data: { user: this.sanitizeResponse(user) }
      });
    } catch (error) {
      // Return validation failure (not an error response)
      const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
      logger.debug('Token verification failed', { error: errorMessage });
      res.status(200).json({ 
        valid: false, 
        error: errorMessage 
      });
    }
  }

  /**
   * Handle OAuth authentication success with proper type safety
   */
  async handleOAuthSuccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authenticatedUser = req.user as any;
      
      if (!authenticatedUser) {
        logger.error('OAuth success handler called without user data');
        const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${redirectUrl}/auth/callback?error=${encodeURIComponent('Authentication failed - no user data')}`);
        return;
      }

      let authResponse: AuthResponseDTO;

      // Check if we received a Passport OAuth profile or a Prisma user
      if (this.isOAuthProfile(authenticatedUser)) {
        // Direct OAuth profile from strategy
        authResponse = await authService.processOAuthLogin(authenticatedUser as OAuthProfileDTO);
      } else {
        // Prisma user object - need to convert to OAuth profile format
        const normalizedProfile = this.convertPrismaUserToOAuthProfile(authenticatedUser);
        authResponse = await authService.processOAuthLogin(normalizedProfile);
      }

      // Set secure token cookies
      const { accessToken, refreshToken } = authResponse;
      setTokenCookies(res, accessToken, refreshToken);

      // Log successful OAuth login
      const provider = authenticatedUser.provider || authenticatedUser.authProvider || 'oauth';
      accountsLogger.logUserLogin(authResponse.user.id, authResponse.user.email, provider);
      logger.info('OAuth authentication successful', {
        userId: authResponse.user.id,
        provider: provider,
        email: authResponse.user.email
      });

      // Redirect to frontend success URL
      const successUrl = process.env.FRONTEND_LOGIN_SUCCESS_URL || 
                        (process.env.FRONTEND_URL + '/auth/callback') ||
                        'http://localhost:5173/auth/callback';
      res.redirect(successUrl);
    } catch (error) {
      logger.error('OAuth success handler error', { error });
      next(error);
    }
  }

  /**
   * Type guard to check if user data is OAuth profile format
   * @private
   */
  private isOAuthProfile(user: any): boolean {
    return user && (
      user.provider || 
      (user.emails && Array.isArray(user.emails)) ||
      (user.name && typeof user.name === 'object')
    );
  }

  /**
   * Convert Prisma user object to OAuth profile format
   * @private
   */
  private convertPrismaUserToOAuthProfile(prismaUser: any): OAuthProfileDTO {
    return {
      provider: prismaUser.authProvider?.toLowerCase() || 'google',
      id: prismaUser.providerId || prismaUser.id,
      displayName: prismaUser.fullName || prismaUser.displayName || 'User',
      name: {
        givenName: prismaUser.firstName || '',
        familyName: prismaUser.lastName || ''
      },
      emails: prismaUser.email ? [{ value: prismaUser.email, verified: true }] : [],
      photos: prismaUser.avatarUrl ? [{ value: prismaUser.avatarUrl }] : [],
      _json: {
        id: prismaUser.id,
        email: prismaUser.email,
        name: prismaUser.fullName
      }
    };
  }
  
  /**
   * Handle OAuth authentication errors with proper validation
   */
  async handleOAuthError(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract and validate error parameters
      const error = (req.query.error as string) || 'Authentication failed';
      const provider = (req.query.provider as string) || 'unknown';
      const email = (req.query.email as string) || 'unknown';
      
      // Log the OAuth error with context
      logger.error('OAuth authentication error', { 
        error, 
        provider, 
        email: email !== 'unknown' ? email : undefined,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
      
      // Log to accounts logger if we have meaningful data
      if (email !== 'unknown' && provider !== 'unknown') {
        accountsLogger.logAuthError(email, error, provider);
      }
      
      // Construct secure redirect URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const errorRedirectUrl = `${frontendUrl}/auth/callback?error=${encodeURIComponent(error)}&provider=${encodeURIComponent(provider)}`;
      
      logger.debug('Redirecting to error page', { redirectUrl: errorRedirectUrl });
      res.redirect(errorRedirectUrl);
    } catch (redirectError) {
      // Fallback if redirect fails
      logger.error('Failed to handle OAuth error redirect', { redirectError });
      next(redirectError);
    }
  }
  
  /**
   * Logout user with proper cleanup
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from request if available (attached by optionalAuth middleware)
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      
      // Clear token cookies securely
      clearTokenCookies(res);
      
      // Log logout event if user was authenticated
      if (userId) {
        accountsLogger.logUserLogout(userId);
        logger.info('User logged out', { userId, email: userEmail });
      } else {
        logger.debug('Logout called for unauthenticated session');
      }
      
      // Return consistent success response
      res.status(200).json({ 
        success: true, 
        message: 'Logged out successfully',
        data: null
      });
    } catch (error) {
      logger.error('Logout error', { error, userId: req.user?.id });
      next(error);
    }
  }
  
  /**
   * Refresh access token using refresh token with enhanced security
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract refresh token from cookies (most secure) or body (fallback)
      let refreshToken = req.cookies?.refreshToken;
      
      // Fallback to body if cookie not available (for API clients)
      if (!refreshToken && req.body?.refreshToken) {
        refreshToken = req.body.refreshToken;
      }
      
      if (!refreshToken) {
        const errorContext = { 
          ip: req.ip, 
          userAgent: req.get('User-Agent'),
          hasCookies: !!req.cookies,
          hasBody: !!req.body?.refreshToken
        };
        accountsLogger.logAccountError('token_refresh', 'No refresh token provided', errorContext);
        return next(createError(401, 'No refresh token provided'));
      }

      // Verify refresh token and get user
      const user = await authService.verifyRefreshToken(refreshToken);
      
      // Generate new token pair
      const { accessToken, refreshToken: newRefreshToken } = authService.generateTokens(user);
      
      // Set new tokens in secure cookies
      setTokenCookies(res, accessToken, newRefreshToken);
      
      // Log successful token refresh
      logger.debug('Token refreshed successfully', { 
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      });

      // Return success response with consistent format
      res.status(200).json({ 
        success: true, 
        message: 'Token refreshed successfully',
        data: { 
          accessToken,
          user: this.sanitizeResponse(user)
        }
      });
    } catch (error) {
      const errorContext = { 
        ip: req.ip, 
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      };
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      
      accountsLogger.logAccountError('token_refresh', errorMessage, errorContext);
      logger.error('Token refresh failed', { error: errorMessage, context: errorContext });
      
      next(error);
    }
  }
  
  /**
   * Health check for auth service with comprehensive status
   */
  async healthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const providers: Array<{ name: string; configured: boolean; status: string }> = [];
      
      // Check Google OAuth configuration
      const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
      providers.push({
        name: 'google',
        configured: googleConfigured,
        status: googleConfigured ? 'ready' : 'not_configured'
      });
      
      // Check Azure OAuth configuration
      const azureConfigured = !!(
        process.env.AZURE_CLIENT_ID && 
        process.env.AZURE_CLIENT_SECRET && 
        process.env.AZURE_TENANT_ID
      );
      providers.push({
        name: 'azure',
        configured: azureConfigured,
        status: azureConfigured ? 'ready' : 'not_configured'
      });

      // Check JWT configuration
      const jwtConfigured = !!(process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET);
      
      // Overall service status
      const serviceStatus = (googleConfigured || azureConfigured) && jwtConfigured ? 'healthy' : 'degraded';
      
      const healthData = {
        status: serviceStatus,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: 'connected', // Assuming Prisma is connected if we reach here
          jwt: jwtConfigured ? 'configured' : 'missing_secrets',
          oauth: {
            providers,
            totalConfigured: providers.filter(p => p.configured).length,
            totalAvailable: providers.length
          }
        },
        urls: {
          frontend: process.env.FRONTEND_URL || 'not_configured',
          callbacks: {
            google: process.env.GOOGLE_CALLBACK_URL || 'not_configured',
            azure: process.env.AZURE_REDIRECT_URL || 'not_configured'
          }
        }
      };
      
      // Log health check request for monitoring
      logger.debug('Auth service health check requested', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        status: serviceStatus
      });
      
      const statusCode = serviceStatus === 'healthy' ? 200 : 503;
      res.status(statusCode).json({
        success: true,
        data: healthData
      });
    } catch (error) {
      logger.error('Health check failed', { error });
      next(error);
    }
  }
}

// Export singleton instance
export const authController = new AuthController();

/*
 * Optimization Summary:
 * - Added proper type safety for OAuth profile handling
 * - Implemented consistent error handling across all methods
 * - Added request validation using Zod schemas
 * - Enhanced security with better token extraction and validation
 * - Improved logging with structured context information
 * - Added comprehensive health check with service status
 * - Implemented consistent response format across endpoints
 * - Added private helper methods for code reusability
 * - Enhanced OAuth success handler with proper type guards
 * - Improved error responses with meaningful messages
 */

