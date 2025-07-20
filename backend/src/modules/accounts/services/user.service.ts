/**
 * User Service
 * Handles user-related business logic
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AppError } from '../../../middleware/errorHandler';
import { PAGINATION } from '../../../config/constants';
import { 
  UserDTO, 
  CreateUserDTO, 
  UpdateUserDTO, 
  ChangePasswordDTO,
  UserFilterOptions,
  UserSortOptions 
} from '../types/user.types';

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
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
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
          firstName: true,
          lastName: true,
          role: true,
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
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
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
      throw new AppError('User with this email already exists', 400);
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
        role: data.role || 'USER'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
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
      throw new AppError('User not found', 404);
    }
    
    // Check if email is being updated and is already taken
    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: data.email }
      });
      
      if (emailTaken) {
        throw new AppError('Email is already taken', 400);
      }
    }
    
    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
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
      throw new AppError('User not found', 404);
    }
    
    // Delete user
    await this.prisma.user.delete({
      where: { id: userId }
    });
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, data: ChangePasswordDTO): Promise<void> {
    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    
    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }
}

// Create singleton instance
const prisma = new PrismaClient();
export const userService = new UserService(prisma);