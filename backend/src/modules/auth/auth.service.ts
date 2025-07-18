/**
 * Auth Service
 * Handles authentication business logic
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthResponseDTO, LoginCredentialsDTO, RegisterDataDTO, UserDTO, UserRole } from './auth.types';

export class AuthService {
  private prisma: PrismaClient;
  private jwtSecret: string;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
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
        role: data.role || UserRole.USER
      }
    });

    // Generate JWT token
    const token = this.generateToken(user.id);

    // Return user data and token
    return {
      user: this.sanitizeUser(user),
      token
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

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user.id);

    // Return user data and token
    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  /**
   * Verify JWT token and return user
   */
  async verifyToken(token: string): Promise<UserDTO> {
    try {
      // Verify token
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId }
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
   * Generate JWT token
   */
  private generateToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtSecret, {
      expiresIn: '7d'
    });
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