import { Request, Response, NextFunction } from 'express';
import { AuthProvider, UserRole } from '@prisma/client';
import 'express-session';
import * as jwt from 'jsonwebtoken';

// Extend Request interface to include user property
interface RequestWithUser extends Request {
  user?: any;
  session?: any;
}
import { 
  generateAccessToken, 
  generateRefreshToken, 
  setTokenCookies, 
  clearTokenCookies,
  RefreshTokenPayload,
  verifyRefreshToken,
  extractRefreshTokenFromRequest,
  extractTokenFromRequest
} from './jwt.js';
import { AuthenticatedRequest } from './requireAuth.js';
import { UserWithRole, getUserById } from './auth.service.js';
import logger, { logUserLogout } from './logger.js';
import { blacklistToken } from './token.service.js';
import * as jwt from 'jsonwebtoken';

/**
 * Authentication response interface
 */
interface AuthResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    authProvider: AuthProvider;
    avatarUrl?: string;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

/**
 * Handle successful OAuth authentication
 * This is called after successful OAuth callback
 */
export const handleAuthSuccess = async (
  req: RequestWithUser,
  res: Response,
  user: UserWithRole
): Promise<void> => {
  try {
    // Generate JWT tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      provider: user.authProvider
    });

    const refreshToken = generateRefreshToken(user.id);

    // Set HTTP-only cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Prepare response data
    const authResponse: AuthResponse = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        authProvider: user.authProvider,
        avatarUrl: user.avatarUrl || undefined
      },
      tokens: {
        accessToken,
        refreshToken
      },
      message: 'Authentication successful'
    };

    // Check if this is an API request or browser request
    const acceptsJson = req.accepts(['html', 'json']) === 'json';
    const frontendUrl = process.env.FRONTEND_URL;

    if (acceptsJson || !frontendUrl) {
      // API request or no frontend URL configured - return JSON
      res.status(200).json(authResponse);
    } else {
      // Browser request - redirect to frontend with success
      const redirectUrl = new URL('/dashboard', frontendUrl);
      redirectUrl.searchParams.set('auth', 'success');
      res.redirect(redirectUrl.toString());
    }
  } catch (error) {
    logger.error('Authentication success handler failed', {
      userId: user.id,
      email: user.email,
      provider: user.authProvider
    }, error as Error);
    handleAuthError(req, res, 'Authentication processing failed');
  }
};

/**
 * Handle OAuth authentication errors
 */
export const handleAuthError = (
  req: RequestWithUser,
  res: Response,
  errorMessage: string = 'Authentication failed'
): void => {
  logger.error('Authentication error occurred', {
    errorMessage,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip
  });

  const acceptsJson = req.accepts(['html', 'json']) === 'json';
  const frontendUrl = process.env.FRONTEND_URL;

  if (acceptsJson || !frontendUrl) {
    // API request or no frontend URL - return JSON error
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: errorMessage
    });
  } else {
    // Browser request - redirect to frontend with error
    const redirectUrl = new URL('/login', frontendUrl);
    redirectUrl.searchParams.set('error', 'auth_failed');
    redirectUrl.searchParams.set('message', errorMessage);
    res.redirect(redirectUrl.toString());
  }
};

/**
 * Google OAuth callback handler
 */
export const googleCallback = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  // This will be called after passport.authenticate('google')
  if (req.user) {
    handleAuthSuccess(req, res, req.user as any);
  } else {
    handleAuthError(req, res, 'Google authentication failed');
  }
};

/**
 * Azure AD OAuth callback handler
 */
export const azureCallback = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  // This will be called after passport.authenticate('azure-ad')
  if (req.user) {
    handleAuthSuccess(req, res, req.user as any);
  } else {
    handleAuthError(req, res, 'Azure AD authentication failed');
  }
};

/**
 * Logout handler
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Get tokens before clearing cookies
    const accessToken = extractTokenFromRequest(req);
    const refreshToken = extractRefreshTokenFromRequest(req);
    
    // Blacklist tokens if they exist
    if (accessToken && req.user) {
      try {
        // Get token expiration from JWT payload
        const decoded = jwt.decode(accessToken) as { exp?: number };
        const expiryDate = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        // Add to blacklist
        await blacklistToken(accessToken, req.user.id, expiryDate, 'User logout');
      } catch (tokenError) {
        logger.error('Failed to blacklist access token', {
          userId: req.user.id,
          error: tokenError instanceof Error ? tokenError.message : 'Unknown error'
        });
      }
    }
    
    if (refreshToken && req.user) {
      try {
        // Get token expiration from JWT payload
        const decoded = jwt.decode(refreshToken) as RefreshTokenPayload;
        const expiryDate = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        // Add to blacklist
        await blacklistToken(refreshToken, req.user.id, expiryDate, 'User logout');
      } catch (tokenError) {
        logger.error('Failed to blacklist refresh token', {
          userId: req.user.id,
          error: tokenError instanceof Error ? tokenError.message : 'Unknown error'
        });
      }
    }
    
    // Clear authentication cookies
    clearTokenCookies(res);

    // Log logout event
    if (req.user) {
      logUserLogout(req.user.id, req.user.email);
    }

    // Destroy session if using sessions
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          logger.error('Session destruction failed', {}, err);
        }
      });
    }

    // Clear user from request
    req.user = undefined;

    const acceptsJson = req.accepts(['html', 'json']) === 'json';
    const frontendUrl = process.env.FRONTEND_URL;

    if (acceptsJson || !frontendUrl) {
      // API request - return JSON
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } else {
      // Browser request - redirect to frontend
      const redirectUrl = new URL('/login', frontendUrl);
      redirectUrl.searchParams.set('message', 'logged_out');
      res.redirect(redirectUrl.toString());
    }
  } catch (error) {
    logger.error('Logout process failed', {
      userId: req.user?.id
    }, error as Error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: 'An error occurred during logout'
    });
  }
};

/**
 * Get current user information
 */
export const getCurrentUser = (req: AuthenticatedRequest, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
        message: 'No authenticated user found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
        authProvider: req.user.authProvider
      },
      message: 'User information retrieved successfully'
    });
  } catch (error) {
    logger.error('Get current user failed', {
      userId: req.user?.id
    }, error as Error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to retrieve user information'
    });
  }
};

/**
 * Refresh token handler
 * Verifies the refresh token and issues a new access token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract refresh token from cookie using the dedicated function
    const refreshToken = extractRefreshTokenFromRequest(req);
    
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: 'Refresh token missing',
        message: 'No refresh token provided'
      });
      return;
    }
    
    // Verify the refresh token
    try {
      // Use the dedicated refresh token verification function
      const decoded = verifyRefreshToken(refreshToken);
      
      // Get user from database
      const user = await getUserById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Generate new tokens
      const newAccessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        provider: user.authProvider,
        role: user.role as 'INVESTOR' | 'CLIENT' | 'ADMIN'
      });
      
      const newRefreshToken = generateRefreshToken(user.id);
      
      // Blacklist the old refresh token for security
      try {
        // Get token expiration from JWT payload
        const decoded = jwt.decode(refreshToken) as RefreshTokenPayload;
        const expiryDate = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        // Add to blacklist
        await blacklistToken(refreshToken, user.id, expiryDate, 'Token refresh');
      } catch (blacklistError) {
        logger.error('Failed to blacklist old refresh token', {
          userId: user.id,
          error: blacklistError instanceof Error ? blacklistError.message : 'Unknown error'
        });
        // Continue with the token refresh process even if blacklisting fails
      }
      
      // Set new tokens as cookies
      setTokenCookies(res, newAccessToken, newRefreshToken);
      
      // Log the token refresh event
      logger.tokenEvent('Token refreshed', {
        'userId': user.id,
        email: user.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || 'unknown'
      });
      
      // Return success response
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully'
      });
    } catch (tokenError) {
      // Clear invalid tokens
      clearTokenCookies(res);
      
      logger.tokenEvent('Token refresh failed', {
        ip: req.ip,
        userAgent: req.headers['user-agent'] || 'unknown',
        error: tokenError instanceof Error ? tokenError.message : 'Unknown error'
      });
      
      // Determine the appropriate error message based on the error
      let errorMessage = 'The provided refresh token is invalid or expired';
      let errorCode = 'Invalid refresh token';
      
      if (tokenError instanceof Error) {
        if (tokenError.message === 'Refresh token expired') {
          errorMessage = 'Your refresh token has expired. Please log in again.';
          errorCode = 'Token expired';
        } else if (tokenError.message === 'Invalid token type') {
          errorMessage = 'The provided token is not a valid refresh token.';
          errorCode = 'Invalid token type';
        }
      }
      
      res.status(401).json({
        success: false,
        error: errorCode,
        message: errorMessage
      });
    }
  } catch (error) {
    logger.error('Refresh token failed', {
      ip: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown'
    }, error as Error);
    
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to refresh token'
    });
  }
};

/**
 * Health check for authentication service
 */
export const authHealthCheck = (req: RequestWithUser, res: Response): void => {
  res.status(200).json({
    success: true,
    service: 'Authentication Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    providers: {
      google: !!process.env.GOOGLE_CLIENT_ID,
      azure: !!process.env.AZURE_CLIENT_ID
    }
  });
};