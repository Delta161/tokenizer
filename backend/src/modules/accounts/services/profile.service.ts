/**
 * Profile Service
 * Handles user profile operations with caching
 * Separated from auth service for better organization
 */

import { prisma } from '../utils/prisma';
import { logger } from '../../../utils/logger';
import type { UserDTO, UpdateUserDTO } from '../types/user.types';
import { createNotFound } from '@middleware/errorHandler';

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

export class ProfileService {
  private cache = new ProfileCache();

  /**
   * Get user profile by ID with caching
   * Optimized for performance with selective field fetching
   */
  async getProfile(userId: string): Promise<UserDTO> {
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

    // Fetch from database with optimized query
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        // Only select fields needed for profile
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
        // Exclude heavy relations like projects, investments, etc.
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
   * Update user profile with cache invalidation
   */
  async updateProfile(userId: string, updateData: UpdateUserDTO): Promise<UserDTO> {
    if (!userId) {
      throw createNotFound('User ID is required');
    }

    // Validate user exists first
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!existingUser) {
      throw createNotFound('User not found');
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateData.fullName && { fullName: updateData.fullName }),
        ...(updateData.avatarUrl && { avatarUrl: updateData.avatarUrl }),
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
      updatedFields: Object.keys(updateData) 
    });

    return updatedUser as UserDTO;
  }

  /**
   * Upload and update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<UserDTO> {
    return this.updateProfile(userId, { avatarUrl });
  }

  /**
   * Get multiple profiles efficiently (for admin operations)
   */
  async getProfiles(userIds: string[]): Promise<UserDTO[]> {
    if (!userIds.length) return [];

    // Check cache for each user
    const cached: UserDTO[] = [];
    const uncachedIds: string[] = [];

    for (const userId of userIds) {
      const cachedProfile = this.cache.get(`profile:${userId}`);
      if (cachedProfile) {
        cached.push(cachedProfile);
      } else {
        uncachedIds.push(userId);
      }
    }

    // Fetch uncached profiles from database
    let uncached: UserDTO[] = [];
    if (uncachedIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: uncachedIds } },
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

      uncached = users as UserDTO[];
      
      // Cache the newly fetched profiles
      uncached.forEach(user => {
        this.cache.set(`profile:${user.id}`, user);
      });
    }

    return [...cached, ...uncached];
  }

  /**
   * Clear all profile cache (useful for testing or manual cache reset)
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Profile cache cleared');
  }

  /**
   * Get cache statistics (for monitoring)
   */
  getCacheStats(): { size: number } {
    return {
      size: this.cache['cache'].size
    };
  }
}

// Export singleton instance
export const profileService = new ProfileService();
