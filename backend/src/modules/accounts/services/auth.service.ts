/**
 * Auth Service
 * Handles authentication business logic
 */

// External packages
import { AuthProvider, PrismaClient } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import jwt from 'jsonwebtoken';

// Internal modules
import { UserRole, type AuthResponseDTO, type OAuthProfileDTO, type UserDTO } from '@modules/accounts/types/auth.types';
import { generateAccessToken, generateRefreshToken, verifyToken } from '@modules/accounts/utils/jwt';
import { mapOAuthProfile } from '@modules/accounts/utils/oauthProfileMapper';
import { formatFullName } from '@modules/accounts/utils/user.utils';
import { logger } from '@utils/logger';
import { NormalizedProfileSchema } from '@modules/accounts/validators/auth.validator';
import { createUserFromOAuthSchema } from '@modules/accounts/validators/user.validator';
import { prisma } from '@modules/accounts/utils/prisma';
import { createBadRequest, createInternalServerError, createNotFound } from '@middleware/errorHandler';

export class AuthService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Register and login methods removed - only OAuth authentication is supported
   */

  /**
   * Verify JWT token and return user
   */
  async verifyToken(token: string): Promise<UserDTO> {
    try {
      // Verify token
      const decoded = verifyToken(token);

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        throw createNotFound('User not found');
      }

      // Return sanitized user
      return this.sanitizeUser(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw createBadRequest('Invalid token');
    }
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<UserDTO | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * Find user by provider ID
   */
  async findUserByProviderId(providerId: string, provider: AuthProvider): Promise<UserDTO | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        providerId,
        authProvider: provider
      }
    });

    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * Process OAuth login
   */
  async processOAuthLogin(profile: OAuthProfileDTO): Promise<AuthResponseDTO> {
    try {
      // Map OAuth profile to normalized format
      const normalizedProfile = mapOAuthProfile(profile, profile.provider);
      
      // Validate profile using schema
      const profileValidation = NormalizedProfileSchema.safeParse(normalizedProfile);
      if (!profileValidation.success) {
        logger.error('Invalid profile data', { errors: profileValidation.error.format() });
        throw createBadRequest('Invalid profile data');
      }
      
      // Use validated data
      const validatedProfile = profileValidation.data;
      
      // Find existing user by provider ID
      let user = await this.prisma.user.findFirst({
        where: {
          authProvider: validatedProfile.provider.toUpperCase() as AuthProvider,
          providerId: validatedProfile.providerId
        }
      });
      
      // If user not found by provider ID, try to find by email
      if (!user && validatedProfile.email) {
        user = await this.prisma.user.findUnique({
          where: { email: validatedProfile.email }
        });
        
        // If user exists with this email but different provider, update provider info
        if (user) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              authProvider: validatedProfile.provider.toUpperCase() as AuthProvider,
              providerId: validatedProfile.providerId
            }
          });
        }
      }
      
      // If user still not found, create new user
      if (!user) {
        try {
          // Format the full name, with fallback to displayName if first/last name are missing
          const fullName = formatFullName(validatedProfile.firstName, validatedProfile.lastName) || 
                          validatedProfile.displayName || 
                          'User';
          
          // Generate a placeholder email if missing
          const email = validatedProfile.email || 
                       `${validatedProfile.providerId}@placeholder.auth`;
          
          // Validate user creation data
          const userDataInput = {
            email,
            fullName,
            authProvider: validatedProfile.provider.toUpperCase() as AuthProvider,
            providerId: validatedProfile.providerId,
            avatarUrl: validatedProfile.avatarUrl,
            role: validatedProfile.role || UserRole.INVESTOR
          };
          
          const userDataValidation = createUserFromOAuthSchema.safeParse(userDataInput);
          if (!userDataValidation.success) {
            logger.error('Invalid user data for creation', { errors: userDataValidation.error.format() });
            throw createBadRequest('Invalid user data for creation');
          }
          
          // Use validated data
          const userData = userDataValidation.data;
          
          user = await this.prisma.user.create({
            data: {
              ...userData,
              lastLoginAt: new Date()
            }
          });
          
          logger.info('Successfully created new user from OAuth profile', { 
            userId: user.id,
            provider: validatedProfile.provider
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error('Failed to create user from OAuth profile', { 
            error: errorMessage,
            profile: validatedProfile 
          });
          throw createInternalServerError(`Failed to create user: ${errorMessage}`);
        }
      } else {
        // Update last login timestamp
        await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
        
        logger.debug('User logged in', {
          userId: user.id,
          provider: validatedProfile.provider,
          email: user.email
        });
      }
      
      // Generate tokens
      const sanitizedUser = this.sanitizeUser(user);
      const { accessToken, refreshToken } = this.generateTokens(sanitizedUser);
      
      // Log OAuth login
      logger.info(`User logged in via ${validatedProfile.provider}`, {
        userId: user.id,
        email: user.email,
        provider: validatedProfile.provider
      });
      
      // Return user data and tokens
      return {
        user: sanitizedUser,
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('OAuth login processing failed', { error });
      throw error;
    }
  }

  /**
   * Generate tokens for authentication
   */
  generateTokens(user: UserDTO): { accessToken: string; refreshToken: string } {
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    const refreshToken = generateRefreshToken(user.id);
    
    return { accessToken, refreshToken };
  }

  /**
   * Sanitize user object by removing sensitive data
   */
  private sanitizeUser(user: any): UserDTO {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _password, ...sanitizedUser } = user;
    return sanitizedUser as UserDTO;
  }
}

// At the bottom
export const authService = new AuthService(prisma);
  

