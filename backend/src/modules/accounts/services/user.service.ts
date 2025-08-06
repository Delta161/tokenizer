/**
 * User Service (LEGACY - Being gradually replaced by specialized services)
 * Handles user-related business logic
 * 
 * @deprecated This service is being phased out in favor of:
 * - ProfileService for profile-related operations  
 * - AdminService for administrative user operations
 * 
 * Use specialized services for new development.
 */

// Internal modules
import { PAGINATION } from '@config/constants';
import { createNotFound, createBadRequest } from '@middleware/errorHandler';
import { getSkipValue } from '../../../utils/pagination';
import type { 
  CreateUserDTO, 
  UpdateUserDTO, 
  UserDTO, 
  UserFilterOptions,
  UserSortOptions 
} from '@modules/accounts/types/user.types';

// Shared Prisma client
import { prisma } from '../utils/prisma';

export class UserService {

  /**
   * Get all users with pagination and filtering
   * @deprecated Use AdminService.getUsers() instead for new development
   */
  async getUsers(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, filters?: UserFilterOptions, sort?: UserSortOptions): Promise<{ users: UserDTO[], total: number }> {
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
    
    // Get users and total count
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
          role: true,
          authProvider: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);
    
    return { users: users as UserDTO[], total };
  }

  /**
   * Get user by ID
   * @deprecated Use ProfileService.getProfile() instead for new development
   */
  async getUserById(userId: string): Promise<UserDTO> {
    const user = await prisma.user.findUnique({
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
   * @deprecated Use AdminService.createUser() instead for new development
   */
  async createUser(data: CreateUserDTO): Promise<UserDTO> {
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existingUser) {
      throw createBadRequest('User with this email already exists');
    }
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        providerId: data.providerId || `legacy-${Date.now()}`, // Handle optional providerId
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
   * @deprecated Use AdminService.updateUser() or ProfileService.updateProfile() instead for new development
   */
  async updateUser(userId: string, data: UpdateUserDTO): Promise<UserDTO> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      throw createNotFound('User not found');
    }
    
    // Check if email is being updated and is already taken
    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: data.email }
      });
      
      if (emailTaken) {
        throw createBadRequest('Email is already taken');
      }
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
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
   * @deprecated Use AdminService.deleteUser() instead for new development
   */
  async deleteUser(userId: string): Promise<void> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      throw createNotFound('User not found');
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });
  }

  /**
   * OAuth-only authentication - no credential management needed
   */
  // Authentication methods removed - only OAuth authentication is supported

  /**
   * Get user statistics for monitoring
   * @deprecated Use AdminService.getUserStats() instead for new development
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    oauthUsers: { google: number; azure: number };
    recentLogins: number;
  }> {
    try {
      const [totalUsers, googleUsers, azureUsers, recentLogins] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { authProvider: 'GOOGLE' } }),
        prisma.user.count({ where: { authProvider: 'AZURE' } }),
        prisma.user.count({
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
      throw createBadRequest('Failed to retrieve user statistics');
    }
  }
}

// Create singleton instance using the shared prisma client
export const userService = new UserService();

