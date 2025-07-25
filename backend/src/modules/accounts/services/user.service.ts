/**
 * User Service
 * Handles user-related business logic
 */

// External packages
import { PrismaClient } from '@prisma/client';

// Internal modules
import { PAGINATION } from '@config/constants';
import { createNotFound, createBadRequest } from '@middleware/errorHandler';
import type { 
  CreateUserDTO, 
  UpdateUserDTO, 
  UserDTO, 
  UserFilterOptions,
  UserSortOptions 
} from '@modules/accounts/types/user.types';

export class UserService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get all users with pagination and filtering
   */
  async getUsers(page = 1, limit = PAGINATION.DEFAULT_LIMIT, filters?: UserFilterOptions, sort?: UserSortOptions): Promise<{ users: UserDTO[], total: number }> {
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const where: any = {};
    
    if (filters?.role) {
      where.role = filters.role;
    }
    
    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    
    if (filters?.createdAfter) {
      where.createdAt = { ...where.createdAt, gte: filters.createdAfter };
    }
    
    if (filters?.createdBefore) {
      where.createdAt = { ...where.createdAt, lte: filters.createdBefore };
    }
    
    // Build sort options
    const orderBy: any = {};
    if (sort) {
      orderBy[sort.field] = sort.direction;
    } else {
      orderBy.createdAt = 'desc';
    }
    
    // Get users and total count
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          authProvider: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      this.prisma.user.count({ where })
    ]);
    
    return { users: users as UserDTO[], total };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserDTO> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        authProvider: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      throw createNotFound('User not found');
    }
    
    return user as UserDTO;
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserDTO): Promise<UserDTO> {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existingUser) {
      throw createBadRequest('User with this email already exists');
    }
    
    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        providerId: data.providerId,
        avatarUrl: data.avatarUrl,
        role: data.role || 'INVESTOR',
        authProvider: data.authProvider,
        phone: data.phone,
        preferredLanguage: data.preferredLanguage,
        timezone: data.timezone
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        authProvider: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return user as UserDTO;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserDTO): Promise<UserDTO> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      throw createNotFound('User not found');
    }
    
    // Check if email is being updated and is already taken
    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: data.email }
      });
      
      if (emailTaken) {
        throw createBadRequest('Email is already taken');
      }
    }
    
    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return updatedUser as UserDTO;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      throw createNotFound('User not found');
    }
    
    // Delete user
    await this.prisma.user.delete({
      where: { id: userId }
    });
  }

  /**
   * Change user password
   */
  // changePassword method removed - only OAuth authentication is supported
}

// Create singleton instance using the shared prisma client
import { prisma } from '../utils/prisma';
export const userService = new UserService(prisma);

