/**
 * User Service 
 * Handles user-related business logic with integrated profile caching
 * Merged ProfileService functionality for cleaner architecture
 */

// Internal modules
import { PAGINATION } from '@config/constants';
import { createNotFound, createBadRequest } from '@middleware/errorHandler';
import { getSkipValue } from '../../../utils/pagination';
import { logger } from '../../../utils/logger';
import type { 
  CreateUserDTO, 
  UpdateUserDTO, 
  UserDTO, 
  UserFilterOptions,
  UserSortOptions 
} from '@modules/accounts/types/user.types';

// Shared Prisma client
import { prisma } from '../utils/prisma';

/**
 * Simple in-memory cache for user profiles
 * In production, this would be replaced with Redis
 */
class ProfileCache {
  private cache = new Map<string, { data: UserDTO; expires: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  get(key: string): UserDTO | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: UserDTO): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.TTL
    });
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export class UserService {
  private cache = new ProfileCache();

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
   * Get user by ID with caching (merged from ProfileService)
   * Optimized for performance with selective field fetching
   */
  async getUserById(userId: string): Promise<UserDTO> {
    if (!userId) {
      throw createNotFound('User ID is required');
    }

    // Check cache first
    const cacheKey = `profile:${userId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.debug('Profile cache hit', { userId });
      return cached;
    }

    logger.debug('Profile cache miss, fetching from database', { userId });

    // Fetch from database with optimized query (matching ProfileService)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        providerId: true,
        avatarUrl: true,
        role: true,
        authProvider: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      throw createNotFound('User not found');
    }

    const userProfile = user as UserDTO;
    
    // Cache the result
    this.cache.set(cacheKey, userProfile);
    
    logger.info('User profile retrieved', { 
      userId, 
      email: user.email,
      cacheStatus: 'miss' 
    });

    return userProfile;
  }

  /**
   * Get user profile by ID (alias for getUserById for compatibility)
   */
  async getProfile(userId: string): Promise<UserDTO> {
    return this.getUserById(userId);
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
   * Update user with cache invalidation (merged from ProfileService)
   */
  async updateUser(userId: string, data: UpdateUserDTO): Promise<UserDTO> {
    if (!userId) {
      throw createNotFound('User ID is required');
    }

    // Validate user exists first
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
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
    
    // Update user with enhanced field selection
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        providerId: true,
        avatarUrl: true,
        role: true,
        authProvider: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Invalidate cache for this user
    this.cache.invalidate(`profile:${userId}`);

    logger.info('User profile updated', { 
      userId, 
      updatedFields: Object.keys(data) 
    });
    
    return updatedUser as UserDTO;
  }

  /**
   * Update user profile (alias for updateUser for compatibility)
   */
  async updateProfile(userId: string, updateData: UpdateUserDTO): Promise<UserDTO> {
    return this.updateUser(userId, updateData);
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

