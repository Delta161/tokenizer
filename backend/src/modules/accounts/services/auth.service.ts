/**
 * Auth Service
 * Handles authentication business logic using OAuth providers only
 * Optimized for type safety, validation, and performance
 */

// External packages
import { AuthProvider } from '@prisma/client';
import createError from 'http-errors';

// Internal modules - Use relative imports only
import { UserRole, type AuthResponseDTO, type OAuthProfileDTO, type UserDTO } from '../types/auth.types';
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

// Shared Prisma client
import { prisma } from '../utils/prisma';

// Global utilities - Use relative imports
import { logger } from '../../../utils/logger';


export class AuthService {

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
      const user = await prisma.user.findUnique({
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
      const user = await prisma.user.findFirst({
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
      
      // Prepare session-based response
      const sanitizedUser = this.sanitizeUser(user);
      
      // Log successful OAuth login with performance metrics
      const processingTime = Date.now() - startTime;
      logger.info('OAuth login completed successfully', {
        userId: user.id,
        email: user.email,
        provider: normalizedProfile.provider,
        processingTimeMs: processingTime,
        isNewUser: !user.lastLoginAt
      });
      
      // Return user data for session-based auth
      return {
        user: sanitizedUser,
        success: true,
        message: 'OAuth login successful'
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
    let user = await prisma.user.findFirst({
      where: {
        authProvider: normalizedProfile.provider.toUpperCase() as AuthProvider,
        providerId: normalizedProfile.providerId
      }
    });

    // If not found by provider, try by email (for account merging)
    if (!user && normalizedProfile.email && !normalizedProfile.email.includes('@placeholder.auth')) {
      user = await prisma.user.findUnique({
        where: { email: normalizedProfile.email }
      });

      // If user exists with this email but different provider, update provider info
      if (user) {
        logger.info('Merging OAuth provider with existing user', {
          userId: user.id,
          existingProvider: user.authProvider,
          newProvider: normalizedProfile.provider
        });

        user = await prisma.user.update({
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
      const user = await prisma.user.create({
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
      await prisma.user.update({
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
   * Sanitize user object by removing sensitive data with validation
   */
  private sanitizeUser(user: any): UserDTO {
    if (!user) {
      throw createError(400, 'Invalid user data');
    }

    // Remove sensitive fields that might be included accidentally
    const { 
      hash, 
      oauthToken,
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
   * Process OAuth success with full business logic
   */
  async processOAuthSuccess(user: any, sessionId: string): Promise<{ 
    redirectUrl: string; 
    user: UserDTO; 
    isNewUser: boolean 
  }> {
    try {
      const startTime = Date.now();

      // Convert user to OAuth profile for processing
      let processedUser: UserDTO;
      let isNewUser = false;

      // Check if this is a new user (created within last minute)
      if (user.createdAt && user.updatedAt) {
        const timeDiff = new Date(user.updatedAt).getTime() - new Date(user.createdAt).getTime();
        isNewUser = timeDiff < 60000; // Less than 1 minute difference
      }

      // Sanitize user data
      processedUser = this.sanitizeUser(user);

      // Update last login
      await this.updateUserLastLogin(user.id);

      // Determine redirect URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const successPath = isNewUser ? '/onboarding' : '/dashboard';
      const redirectUrl = `${frontendUrl}${successPath}`;

      // Log successful OAuth processing
      const processingTime = Date.now() - startTime;
      logger.info('OAuth success processing completed', {
        userId: user.id,
        isNewUser,
        processingTimeMs: processingTime,
        redirectUrl
      });

      return {
        redirectUrl,
        user: processedUser,
        isNewUser
      };
    } catch (error: any) {
      logger.error('OAuth success processing failed', {
        error: error?.message,
        userId: user?.id
      });
      throw createError(500, 'OAuth processing failed');
    }
  }

  /**
   * Get OAuth provider health status
   */
  async getOAuthHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    providers: Array<{ name: string; configured: boolean }>;
    services: object;
  }> {
    try {
      // Check OAuth provider configurations
      const providers = [
        {
          name: 'google',
          configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
        },
        {
          name: 'microsoft',
          configured: !!(
            process.env.AZURE_CLIENT_ID && 
            process.env.AZURE_CLIENT_SECRET && 
            process.env.AZURE_TENANT_ID
          )
        },
        {
          name: 'apple',
          configured: !!(
            process.env.APPLE_CLIENT_ID && 
            process.env.APPLE_PRIVATE_KEY_ID
          )
        }
      ];

      const configuredProviders = providers.filter(p => p.configured);
      const totalConfigured = configuredProviders.length;

      // Determine service status
      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (totalConfigured >= 2) {
        status = 'healthy';
      } else if (totalConfigured >= 1) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      // Test database connection
      await prisma.$queryRaw`SELECT 1`;

      return {
        status,
        providers,
        services: {
          database: 'connected',
          sessions: 'enabled',
          oauth: {
            providers,
            totalConfigured,
            totalAvailable: providers.length
          }
        }
      };
    } catch (error: any) {
      logger.error('Health check failed', { error: error?.message });
      return {
        status: 'unhealthy',
        providers: [],
        services: {
          database: 'error',
          sessions: 'unknown',
          oauth: {
            providers: [],
            totalConfigured: 0,
            totalAvailable: 0
          }
        }
      };
    }
  }

  /**
   * Handle OAuth error with proper logging
   */
  async handleOAuthError(
    error: string,
    provider: string,
    req: any
  ): Promise<{ redirectUrl: string }> {
    try {
      // Log the OAuth error
      logger.error('OAuth authentication error', {
        error: error.substring(0, 200),
        provider: provider.substring(0, 50),
        userAgent: req.get('User-Agent')?.substring(0, 200),
        ipAddress: req.ip,
        timestamp: new Date().toISOString()
      });

      // Build error redirect URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const errorPath = '/auth/callback';
      
      const errorParams = new URLSearchParams({
        error: error.substring(0, 200),
        provider: provider.substring(0, 50),
        timestamp: new Date().toISOString()
      });

      const redirectUrl = `${frontendUrl}${errorPath}?${errorParams.toString()}`;

      // Validate URL before returning
      try {
        new URL(redirectUrl);
        return { redirectUrl };
      } catch (urlError) {
        logger.warn('Invalid error redirect URL, using fallback', { 
          attemptedUrl: redirectUrl 
        });
        return { redirectUrl: `${frontendUrl}/auth/error` };
      }
    } catch (error: any) {
      logger.error('Failed to handle OAuth error', { error: error?.message });
      const fallbackUrl = (process.env.FRONTEND_URL || 'http://localhost:5173') + '/auth/error';
      return { redirectUrl: fallbackUrl };
    }
  }
}

// Export singleton instance for use across the application
export const authService = new AuthService();
  

