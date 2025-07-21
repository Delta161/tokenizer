/**
 * Auth Service
 * Handles authentication business logic
 */

// External packages
import { AuthProvider, PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Internal modules
import type { AuthResponseDTO, OAuthProfileDTO, UserDTO, UserRole } from '@modules/accounts/types/auth.types';
import { generateAccessToken, generateRefreshToken, verifyToken } from '@modules/accounts/utils/jwt';
import { mapOAuthProfile, validateNormalizedProfile } from '@modules/accounts/utils/oauthProfileMapper';
import { logger } from '@utils/logger';

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
        throw new Error('User not found');
      }

      // Return sanitized user
      return this.sanitizeUser(user);
    } catch (error) {
      throw new Error('Invalid token');
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
      
      // Validate profile
      if (!validateNormalizedProfile(normalizedProfile)) {
        throw new Error('Invalid profile data');
      }
      
      // Find existing user by provider ID
      let user = await this.prisma.user.findFirst({
        where: {
          authProvider: normalizedProfile.provider.toUpperCase() as AuthProvider,
          providerId: normalizedProfile.providerId
        }
      });
      
      // If user not found by provider ID, try to find by email
      if (!user && normalizedProfile.email) {
        user = await this.prisma.user.findUnique({
          where: { email: normalizedProfile.email }
        });
        
        // If user exists with this email but different provider, update provider info
        if (user) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              authProvider: normalizedProfile.provider.toUpperCase() as AuthProvider,
              providerId: normalizedProfile.providerId
            }
          });
        }
      }
      
      // If user still not found, create new user
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: normalizedProfile.email,
            firstName: normalizedProfile.firstName,
            lastName: normalizedProfile.lastName,
            authProvider: normalizedProfile.provider.toUpperCase() as AuthProvider,
            providerId: normalizedProfile.providerId,
            avatarUrl: normalizedProfile.avatarUrl,
            role: normalizedProfile.role || UserRole.USER,
            lastLoginAt: new Date()
          }
        });
      } else {
        // Update last login timestamp
        await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
      }
      
      // Generate tokens
      const sanitizedUser = this.sanitizeUser(user);
      const { accessToken, refreshToken } = this.generateTokens(sanitizedUser);
      
      // Log OAuth login
      logger.info(`User logged in via ${normalizedProfile.provider}`, {
        userId: user.id,
        email: user.email,
        provider: normalizedProfile.provider
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
    const { password, ...sanitizedUser } = user;
    return sanitizedUser as UserDTO;
  }
}

// Create singleton instance using the shared prisma client
import { prisma } from '../utils/prisma';
export const authService = new AuthService(prisma);

