/**
 * Admin Service  
 * Handles administrative user operations
 * Separated from user service for security and organization
 */

import { prisma } from '../utils/prisma';
import { logger } from '../../../utils/logger';
import { getSkipValue } from '../../../utils/pagination';
import { PAGINATION } from '@config/constants';
import { createNotFound, createBadRequest } from '@middleware/errorHandler';
import type { 
  UserDTO, 
  UserFilterOptions, 
  UserSortOptions,
  CreateUserDTO 
} from '../types/user.types';

export class AdminService {

  /**
   * Get all users with pagination and filtering (Admin only)
   * Optimized query with proper filtering
   */
  async getUsers(
    page = PAGINATION.DEFAULT_PAGE, 
    limit = PAGINATION.DEFAULT_LIMIT, 
    filters?: UserFilterOptions, 
    sort?: UserSortOptions
  ): Promise<{ users: UserDTO[], total: number }> {
    
    // Calculate skip value using the utility function
    const skip = getSkipValue(page, limit);
    
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
    
    // Get users and total count in parallel
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          providerId: true,
          role: true,
          authProvider: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true
        }
      }),
      prisma.user.count({ where })
    ]);
    
    logger.info('Admin retrieved users list', { 
      page, 
      limit, 
      total, 
      filters: filters || {},
      sort: sort || {} 
    });
    
    return { users: users as UserDTO[], total };
  }

  /**
   * Get user by ID (Admin only)
   * Full user details for administrative purposes
   */
  async getUserById(userId: string): Promise<UserDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        providerId: true,
        role: true,
        authProvider: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        deletedAt: true,
        phone: true,
        preferredLanguage: true,
        timezone: true
      }
    });
    
    if (!user) {
      throw createNotFound('User not found');
    }

    logger.info('Admin retrieved user details', { 
      adminAction: 'getUserById',
      targetUserId: userId 
    });
    
    return user as UserDTO;
  }

  /**
   * Create user (Admin only)
   * Administrative user creation with full validation
   */
  async createUser(userData: CreateUserDTO): Promise<UserDTO> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    
    if (existingUser) {
      throw createBadRequest('User with this email already exists');
    }
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        fullName: userData.fullName,
        providerId: userData.providerId || `manual-${Date.now()}`, // Generate providerId if not provided
        role: userData.role,
        authProvider: userData.authProvider,
        ...(userData.avatarUrl && { avatarUrl: userData.avatarUrl }),
        ...(userData.phone && { phone: userData.phone }),
        ...(userData.preferredLanguage && { preferredLanguage: userData.preferredLanguage }),
        ...(userData.timezone && { timezone: userData.timezone })
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        providerId: true,
        role: true,
        authProvider: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        deletedAt: true,
        phone: true,
        preferredLanguage: true,
        timezone: true
      }
    });

    logger.info('Admin created new user', { 
      adminAction: 'createUser',
      newUserId: user.id,
      email: user.email,
      role: user.role 
    });
    
    return user as UserDTO;
  }

  /**
   * Update user (Admin only)  
   * Administrative user updates with audit logging
   */
  async updateUser(userId: string, updateData: Partial<CreateUserDTO>): Promise<UserDTO> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    });
    
    if (!existingUser) {
      throw createNotFound('User not found');
    }

    // Log the update attempt
    const updateFields = Object.keys(updateData);
    logger.info('Admin updating user', { 
      adminAction: 'updateUser',
      targetUserId: userId,
      updateFields 
    });
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateData.fullName && { fullName: updateData.fullName }),
        ...(updateData.role && { role: updateData.role }),
        ...(updateData.avatarUrl !== undefined && { avatarUrl: updateData.avatarUrl }),
        ...(updateData.phone !== undefined && { phone: updateData.phone }),
        ...(updateData.preferredLanguage && { preferredLanguage: updateData.preferredLanguage }),
        ...(updateData.timezone && { timezone: updateData.timezone }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        providerId: true,
        role: true,
        authProvider: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        deletedAt: true,
        phone: true,
        preferredLanguage: true,
        timezone: true
      }
    });

    logger.info('Admin updated user successfully', { 
      adminAction: 'updateUser',
      targetUserId: userId,
      updatedFields: updateFields,
      previousRole: existingUser.role,
      newRole: user.role 
    });
    
    return user as UserDTO;
  }

  /**
   * Soft delete user (Admin only)
   * Mark user as deleted without removing data
   */
  async deleteUser(userId: string): Promise<void> {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, deletedAt: true }
    });
    
    if (!existingUser) {
      throw createNotFound('User not found');
    }

    if (existingUser.deletedAt) {
      throw createBadRequest('User is already deleted');
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    });

    logger.warn('Admin soft-deleted user', { 
      adminAction: 'deleteUser',
      targetUserId: userId,
      targetEmail: existingUser.email 
    });
  }

  /**
   * Restore soft-deleted user (Admin only)
   */
  async restoreUser(userId: string): Promise<UserDTO> {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, deletedAt: true }
    });
    
    if (!existingUser) {
      throw createNotFound('User not found');
    }

    if (!existingUser.deletedAt) {
      throw createBadRequest('User is not deleted');
    }
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        providerId: true,
        role: true,
        authProvider: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        deletedAt: true,
        phone: true,
        preferredLanguage: true,
        timezone: true
      }
    });

    logger.info('Admin restored deleted user', { 
      adminAction: 'restoreUser',
      targetUserId: userId,
      targetEmail: existingUser.email 
    });
    
    return user as UserDTO;
  }

  /**
   * Get user statistics (Admin only)
   * Dashboard metrics for admin interface
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    deletedUsers: number;
    usersByRole: Record<string, number>;
    recentRegistrations: number;
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      activeUsers,
      deletedUsers,
      usersByRole,
      recentRegistrations
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: { not: null } } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
        where: { deletedAt: null }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null
        }
      })
    ]);

    const roleStats = usersByRole.reduce((acc, curr) => {
      acc[curr.role] = curr._count.role;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      totalUsers,
      activeUsers,
      deletedUsers,
      usersByRole: roleStats,
      recentRegistrations
    };

    logger.info('Admin retrieved user statistics', { stats });

    return stats;
  }
}

// Export singleton instance
export const adminService = new AdminService();
