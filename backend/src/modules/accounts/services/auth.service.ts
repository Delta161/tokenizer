/**
 * Auth Service
 * Handles authentication business logic using OAuth providers only
 * Optimized for type safety, validation, and performance
 */

// External packages
import { AuthProvider, PrismaClient } from '@prisma/client';
import createError from 'http-errors';

// Internal modules - Use relative imports only
import { UserRole, type AuthResponseDTO, type OAuthProfileDTO, type UserDTO } from '../types/auth.types';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyToken, 
  verifyRefreshToken 
} from '../utils/jwt';
import { 
  validateAndProcessEmail,
  validateAndProcessFullName,
  generatePlaceholderEmail,
  validateUserCreationData,
  NormalizedProfileSchema,
  RelaxedNormalizedProfileSchema,
  OAuthProfileSchema,
  transformOAuthError
} from '../validators/auth.validator';
import { createUserFromOAuthSchema } from '../validators/user.validator';

// Global utilities - Use relative imports
import { logger } from '../../../utils/logger';
import { prisma } from '../../../prisma/client';


export class AuthService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Verify JWT token and return user with enhanced validation
   */
  async verifyToken(token: string): Promise<UserDTO> {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw createError(401, 'Invalid token format');
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      if (!decoded?.id) {
        throw createError(401, 'Invalid token payload');
      }

      // Find user with optimized query
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          authProvider: true,
          providerId: true,
          avatarUrl: true,
          lastLoginAt: true
        }
      });

      if (!user) {
        logger.debug('User not found for token', { userId: decoded.id });
        throw createError(404, 'User not found');
      }

      // Return sanitized user
      return this.sanitizeUser(user);
    } catch (error: any) {
      // Enhanced error handling with context
      if (error?.statusCode) {
        throw error; // Re-throw HTTP errors as-is
      }
      
      const errorMessage = error?.message || 'Token verification failed';
      logger.debug('Token verification failed', { 
        error: errorMessage,
        tokenLength: token.length 
      });
      throw createError(401, 'Invalid or expired token');
    }
  }

  /**
   * Find user by email with optimized query
   */
  async findUserByEmail(email: string): Promise<UserDTO | null> {
    if (!email || typeof email !== 'string') {
      return null;
    }

    // Validate and normalize email
    const processedEmail = validateAndProcessEmail(email);
    if (!processedEmail) {
      return null;
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { email: processedEmail },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          authProvider: true,
          providerId: true,
          avatarUrl: true,
          lastLoginAt: true
        }
      });

      return user ? this.sanitizeUser(user) : null;
    } catch (error: any) {
      logger.error('Failed to find user by email', { 
        error: error?.message,
        email: processedEmail 
      });
      return null;
    }
  }

  /**
   * Find user by provider ID with enhanced validation
   */
  async findUserByProviderId(providerId: string, provider: AuthProvider): Promise<UserDTO | null> {
    if (!providerId || typeof providerId !== 'string' || !provider) {
      return null;
    }

    try {
      const user = await this.prisma.user.findFirst({
        where: {
          providerId: providerId.trim(),
          authProvider: provider
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          authProvider: true,
          providerId: true,
          avatarUrl: true,
          lastLoginAt: true
        }
      });

      return user ? this.sanitizeUser(user) : null;
    } catch (error: any) {
      logger.error('Failed to find user by provider ID', { 
        error: error?.message,
        providerId,
        provider 
      });
      return null;
    }
  }
  /**
   * Verify refresh token and return user with enhanced security
   * @param token Refresh token to verify
   * @returns UserDTO
   */
  async verifyRefreshToken(token: string): Promise<UserDTO> {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw createError(401, 'Invalid refresh token format');
    }

    try {
      const { userId } = verifyRefreshToken(token);
      
      if (!userId) {
        throw createError(401, 'Invalid refresh token payload');
      }

      const user = await this.prisma.user.findUnique({ 
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          authProvider: true,
          providerId: true,
          avatarUrl: true,
          lastLoginAt: true
        }
      });

      if (!user) {
        logger.debug('User not found for refresh token', { userId });
        throw createError(401, 'Invalid refresh token - user not found');
      }

      return this.sanitizeUser(user);
    } catch (error: any) {
      if (error?.statusCode) {
        throw error; // Re-throw HTTP errors as-is
      }
      
      logger.debug('Refresh token verification failed', { 
        error: error?.message,
        tokenLength: token.length 
      });
      throw createError(401, 'Invalid or expired refresh token');
    }
  }
  

  /**
   * Process OAuth login with enhanced validation and error handling
   */
  async processOAuthLogin(profile: OAuthProfileDTO): Promise<AuthResponseDTO> {
    const startTime = Date.now();
    
    try {
      // Validate incoming OAuth profile
      const profileValidationResult = OAuthProfileSchema.safeParse(profile);
      if (!profileValidationResult.success) {
        const validationError = transformOAuthError(profileValidationResult.error, profile.provider as any);
        logger.error('Invalid OAuth profile received', { 
          errors: profileValidationResult.error.format(),
          provider: profile.provider 
        });
        throw createError(400, `Invalid OAuth profile: ${validationError.message}`);
      }

      // Normalize and validate profile data using the validator utilities
      const normalizedProfile = await this.normalizeOAuthProfile(profile);
      
      // Find or create user
      const user = await this.findOrCreateUserFromProfile(normalizedProfile);
      
      // Update last login timestamp
      await this.updateUserLastLogin(user.id);
      
      // Generate tokens
      const sanitizedUser = this.sanitizeUser(user);
      const { accessToken, refreshToken } = this.generateTokens(sanitizedUser);
      
      // Log successful OAuth login with performance metrics
      const processingTime = Date.now() - startTime;
      logger.info('OAuth login completed successfully', {
        userId: user.id,
        email: user.email,
        provider: normalizedProfile.provider,
        processingTimeMs: processingTime,
        isNewUser: !user.lastLoginAt
      });
      
      // Return user data and tokens
      return {
        user: sanitizedUser,
        accessToken,
        refreshToken
      };
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logger.error('OAuth login processing failed', { 
        error: error?.message || 'Unknown error',
        provider: profile?.provider,
        processingTimeMs: processingTime,
        profileId: profile?.id
      });
      
      // Re-throw HTTP errors as-is, wrap others
      if (error?.statusCode) {
        throw error;
      }
      
      throw createError(500, `OAuth login failed: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Normalize OAuth profile using validator utilities
   * @private
   */
  private async normalizeOAuthProfile(profile: OAuthProfileDTO) {
    // Extract and validate email
    const email = validateAndProcessEmail(profile.emails?.[0]?.value);
    
    // Process full name using validator utility
    const fullNameData = validateAndProcessFullName({
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      displayName: profile.displayName,
      email: email || undefined,
      provider: profile.provider as 'google' | 'azure-ad'
    });

    const normalizedProfile = {
      provider: profile.provider,
      providerId: profile.id,
      email: email || generatePlaceholderEmail(profile.id, profile.provider as 'google' | 'azure-ad'),
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
      displayName: profile.displayName || fullNameData,
      avatarUrl: profile.photos?.[0]?.value || null,
      role: UserRole.INVESTOR
    };

    // Use relaxed validation first to allow authentication with incomplete data
    const relaxedValidationResult = RelaxedNormalizedProfileSchema.safeParse(normalizedProfile);
    if (!relaxedValidationResult.success) {
      logger.error('Profile failed relaxed validation', { 
        profile: normalizedProfile,
        errors: relaxedValidationResult.error.format()
      });
      throw createError(400, 'Invalid profile data: Missing critical fields');
    }

    // Try strict validation for better data quality
    const strictValidationResult = NormalizedProfileSchema.safeParse(normalizedProfile);
    if (!strictValidationResult.success) {
      logger.warn('Profile passed relaxed but failed strict validation', { 
        providerId: normalizedProfile.providerId,
        provider: normalizedProfile.provider,
        missingFields: strictValidationResult.error.format()
      });
    }

    return relaxedValidationResult.data;
  }

  /**
   * Find existing user or create new one from OAuth profile
   * @private
   */
  private async findOrCreateUserFromProfile(normalizedProfile: any) {
    // Find existing user by provider ID first (most reliable)
    let user = await this.prisma.user.findFirst({
      where: {
        authProvider: normalizedProfile.provider.toUpperCase() as AuthProvider,
        providerId: normalizedProfile.providerId
      }
    });

    // If not found by provider, try by email (for account merging)
    if (!user && normalizedProfile.email && !normalizedProfile.email.includes('@placeholder.auth')) {
      user = await this.prisma.user.findUnique({
        where: { email: normalizedProfile.email }
      });

      // If user exists with this email but different provider, update provider info
      if (user) {
        logger.info('Merging OAuth provider with existing user', {
          userId: user.id,
          existingProvider: user.authProvider,
          newProvider: normalizedProfile.provider
        });

        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            authProvider: normalizedProfile.provider.toUpperCase() as AuthProvider,
            providerId: normalizedProfile.providerId,
            // Update avatar if new one is available
            ...(normalizedProfile.avatarUrl && { avatarUrl: normalizedProfile.avatarUrl })
          }
        });
      }
    }

    // Create new user if still not found
    if (!user) {
      user = await this.createUserFromOAuthProfile(normalizedProfile);
    }

    return user;
  }

  /**
   * Create new user from OAuth profile with validation
   * @private
   */
  private async createUserFromOAuthProfile(normalizedProfile: any) {
    try {
      // Prepare user creation data
      const fullName = [normalizedProfile.firstName, normalizedProfile.lastName]
        .filter(Boolean)
        .join(' ') || 
        normalizedProfile.displayName || 
        'User';

      const userCreationData = {
        email: normalizedProfile.email,
        fullName,
        authProvider: normalizedProfile.provider.toUpperCase() as AuthProvider,
        providerId: normalizedProfile.providerId,
        avatarUrl: normalizedProfile.avatarUrl,
        role: normalizedProfile.role || UserRole.INVESTOR
      };

      // Validate user creation data using the existing validator
      const validatedUserData = validateUserCreationData(userCreationData, normalizedProfile.provider as 'google' | 'azure-ad');

      // Create user in database
      const user = await this.prisma.user.create({
        data: {
          ...validatedUserData,
          lastLoginAt: new Date()
        }
      });

      logger.info('Successfully created new user from OAuth profile', {
        userId: user.id,
        provider: normalizedProfile.provider,
        email: user.email,
        hasAvatar: !!user.avatarUrl
      });

      return user;
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      logger.error('Failed to create user from OAuth profile', {
        error: errorMessage,
        provider: normalizedProfile.provider,
        providerId: normalizedProfile.providerId
      });

      // Re-throw HTTP errors as-is
      if (error?.statusCode) {
        throw error;
      }

      throw createError(500, `Failed to create user: ${errorMessage}`);
    }
  }

  /**
   * Update user's last login timestamp
   * @private
   */
  private async updateUserLastLogin(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() }
      });
    } catch (error: any) {
      // Don't fail the entire login process if this fails
      logger.warn('Failed to update last login timestamp', {
        userId,
        error: error?.message
      });
    }
  }

  /**
   * Generate tokens for authentication with enhanced security
   */
  generateTokens(user: UserDTO): { accessToken: string; refreshToken: string } {
    if (!user?.id || !user?.email || !user?.role) {
      throw createError(400, 'Invalid user data for token generation');
    }

    try {
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(user.id);

      logger.debug('Tokens generated successfully', { 
        userId: user.id,
        accessTokenLength: accessToken.length,
        refreshTokenLength: refreshToken.length
      });

      return { accessToken, refreshToken };
    } catch (error: any) {
      logger.error('Failed to generate tokens', { 
        error: error?.message,
        userId: user.id 
      });
      throw createError(500, 'Token generation failed');
    }
  }

  /**
   * Sanitize user object by removing sensitive data with validation
   */
  private sanitizeUser(user: any): UserDTO {
    if (!user) {
      throw createError(400, 'Invalid user data');
    }

    // Remove sensitive fields that might be included accidentally
    const { 
      _password, 
      password, 
      hash, 
      salt, 
      refreshToken,
      ...sanitizedUser 
    } = user;

    // Ensure all required fields are present
    const requiredFields = ['id', 'email', 'fullName', 'role', 'createdAt', 'updatedAt'];
    const missingFields = requiredFields.filter(field => !sanitizedUser[field]);
    
    if (missingFields.length > 0) {
      logger.warn('User data missing required fields', { 
        missingFields,
        userId: user.id 
      });
    }

    return sanitizedUser as UserDTO;
  }

  /**
   * Get user statistics for monitoring
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    oauthUsers: { google: number; azure: number };
    recentLogins: number;
  }> {
    try {
      const [totalUsers, googleUsers, azureUsers, recentLogins] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { authProvider: 'GOOGLE' } }),
        this.prisma.user.count({ where: { authProvider: 'AZURE' } }),
        this.prisma.user.count({
          where: {
            lastLoginAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        })
      ]);

      return {
        totalUsers,
        oauthUsers: {
          google: googleUsers,
          azure: azureUsers
        },
        recentLogins
      };
    } catch (error: any) {
      logger.error('Failed to get user statistics', { error: error?.message });
      throw createError(500, 'Failed to retrieve user statistics');
    }
  }
}

// Export singleton instance for use across the application
export const authService = new AuthService(prisma);

/*
 * Auth Service Optimization Summary:
 * - Enhanced input validation and type safety across all methods
 * - Optimized database queries with selective field projection
 * - Improved error handling with structured logging and context
 * - Better integration with auth validator utilities
 * - Enhanced OAuth profile processing with comprehensive validation
 * - Added performance monitoring and metrics collection
 * - Implemented secure token generation with validation
 * - Enhanced user sanitization with security-focused field removal
 * - Added user statistics method for monitoring and analytics
 * - Improved separation of concerns with private helper methods
 * - Better compatibility with controller, middleware, and strategies
 * - Enhanced logging for debugging and monitoring
 */
  

