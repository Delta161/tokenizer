/**
 * Auth Service
 * Handles authentication business logic
 */

import { PrismaClient, AuthProvider } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthResponseDTO, LoginCredentialsDTO, RegisterDataDTO, UserDTO, UserRole, OAuthProfileDTO } from './auth.types';
import { generateAccessToken, generateRefreshToken, verifyToken } from './jwt';
import { logger } from '../../utils/logger';
import { mapOAuthProfile, validateNormalizedProfile } from './oauthProfileMapper';

export class AuthService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Register a new user
   */
  async register(data: RegisterDataDTO): Promise<AuthResponseDTO> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || UserRole.USER,
        authProvider: 'EMAIL',
        lastLoginAt: new Date()
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(this.sanitizeUser(user));

    // Log registration
    logger.info('User registered', { userId: user.id, email: user.email });

    // Return user data and tokens
    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  /**
   * Login a user
   */
  async login(credentials: LoginCredentialsDTO): Promise<AuthResponseDTO> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is using OAuth
    if (user.authProvider !== 'EMAIL') {
      throw new Error(`This account uses ${user.authProvider} authentication. Please sign in with ${user.authProvider}.`);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(this.sanitizeUser(user));

    // Log login
    logger.info('User logged in', { userId: user.id, email: user.email });

    // Return user data and tokens
    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

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
            // For OAuth users, set a random password they can't use
            password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
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

// Create singleton instance
const prisma = new PrismaClient();
export const authService = new AuthService(prisma);