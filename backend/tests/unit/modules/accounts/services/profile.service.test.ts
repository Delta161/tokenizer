/**
 * ProfileService Unit Tests
 * Tests for the ProfileService class with caching functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi, MockedFunction } from 'vitest';
import { ProfileService } from '@modules/accounts/services/profile.service';
import { prisma } from '@modules/accounts/utils/prisma';
import { createNotFound } from '@middleware/errorHandler';

// Mock dependencies
vi.mock('@modules/accounts/utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}));

vi.mock('@middleware/errorHandler', () => ({
  createNotFound: vi.fn()
}));

describe('ProfileService', () => {
  let profileService: ProfileService;
  const mockPrismaUser = {
    findUnique: vi.fn(),
    update: vi.fn()
  };
  const mockCreateNotFound = createNotFound as MockedFunction<any>;

  beforeEach(() => {
    profileService = new ProfileService();
    vi.clearAllMocks();
    // Override the mocked prisma.user with our mock functions
    (prisma.user as any) = mockPrismaUser;
  });

  afterEach(() => {
    // Clear cache after each test
    (profileService as any).cache.clear();
  });

  describe('getProfile', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'INVESTOR',
      authProvider: 'GOOGLE',
      providerId: 'google-123',
      avatarUrl: 'https://example.com/avatar.jpg',
      phone: '+1234567890',
      preferredLanguage: 'en',
      timezone: 'UTC',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
      deletedAt: null
    };

    it('should return user profile from database on first call', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      const result = await profileService.getProfile('user-123');

      expect(result).toEqual(mockUser);
      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          authProvider: true,
          providerId: true,
          avatarUrl: true,
          phone: true,
          preferredLanguage: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true
        }
      });
    });

    it('should return cached user profile on second call', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      // First call
      await profileService.getProfile('user-123');
      
      // Second call
      const result = await profileService.getProfile('user-123');

      expect(result).toEqual(mockUser);
      expect(mockPrismaUser.findUnique).toHaveBeenCalledTimes(1); // Only called once due to caching
    });

    it('should throw NotFound error when user does not exist', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      const mockError = new Error('User not found');
      mockCreateNotFound.mockReturnValue(mockError);

      await expect(profileService.getProfile('nonexistent-user'))
        .rejects.toThrow('User not found');

      expect(mockCreateNotFound).toHaveBeenCalledWith('User not found');
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaUser.findUnique.mockRejectedValue(dbError);

      await expect(profileService.getProfile('user-123'))
        .rejects.toThrow('Database connection failed');
    });

    it('should use cache TTL correctly', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      // Get profile to populate cache
      await profileService.getProfile('user-123');

      // Manually expire the cache entry
      const cache = (profileService as any).cache;
      const cacheEntry = cache.cache.get('user-123');
      cacheEntry.timestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago

      // Next call should hit database again
      await profileService.getProfile('user-123');

      expect(mockPrismaUser.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateProfile', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'INVESTOR',
      authProvider: 'GOOGLE',
      providerId: 'google-123',
      avatarUrl: 'https://example.com/avatar.jpg',
      phone: '+1234567890',
      preferredLanguage: 'en',
      timezone: 'UTC',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
      deletedAt: null
    };

    const updateData = {
      fullName: 'Updated User',
      phone: '+0987654321',
      timezone: 'EST'
    };

    it('should update user profile and clear cache', async () => {
      mockPrismaUser.update.mockResolvedValue({ ...mockUser, ...updateData });

      const result = await profileService.updateProfile('user-123', updateData);

      expect(result).toEqual({ ...mockUser, ...updateData });
      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateData,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          authProvider: true,
          providerId: true,
          avatarUrl: true,
          phone: true,
          preferredLanguage: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true
        }
      });
    });

    it('should clear cache after successful update', async () => {
      // Populate cache first
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      await profileService.getProfile('user-123');

      // Update should clear cache
      mockPrismaUser.update.mockResolvedValue({ ...mockUser, ...updateData });
      await profileService.updateProfile('user-123', updateData);

      // Next getProfile call should hit database
      mockPrismaUser.findUnique.mockResolvedValue({ ...mockUser, ...updateData });
      await profileService.getProfile('user-123');

      expect(mockPrismaUser.findUnique).toHaveBeenCalledTimes(2); // Called twice due to cache clear
    });

    it('should handle update errors gracefully', async () => {
      const dbError = new Error('Update failed');
      mockPrismaUser.update.mockRejectedValue(dbError);

      await expect(profileService.updateProfile('user-123', updateData))
        .rejects.toThrow('Update failed');
    });

    it('should not update restricted fields', async () => {
      const restrictedData = {
        id: 'new-id',
        email: 'new@example.com',
        authProvider: 'AZURE' as any,
        providerId: 'new-provider-id',
        fullName: 'Updated Name' // This should be allowed
      };

      mockPrismaUser.update.mockResolvedValue(mockUser);

      await profileService.updateProfile('user-123', restrictedData);

      // Only fullName should be in the update data
      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { fullName: 'Updated Name' },
        select: expect.any(Object)
      });
    });
  });

  describe('clearCache', () => {
    it('should clear all cache', () => {
      const cache = (profileService as any).cache;
      
      // Manually add cache entry
      cache.cache.set('user-123', {
        data: { id: 'user-123', name: 'Test' },
        timestamp: Date.now()
      });

      profileService.clearCache();

      expect(cache.cache.has('user-123')).toBe(false);
    });
  });

  describe('ProfileCache', () => {
    it('should store and retrieve data correctly', () => {
      const cache = (profileService as any).cache;
      const testData = { id: 'test', name: 'Test User' };

      cache.set('test-key', testData);
      const result = cache.get('test-key');

      expect(result).toEqual(testData);
    });

    it('should return null for expired data', () => {
      const cache = (profileService as any).cache;
      const testData = { id: 'test', name: 'Test User' };

      // Set data with expired timestamp
      cache.cache.set('test-key', {
        data: testData,
        timestamp: Date.now() - (6 * 60 * 1000) // 6 minutes ago
      });

      const result = cache.get('test-key');

      expect(result).toBeNull();
    });

    it('should clear all data when clear() is called', () => {
      const cache = (profileService as any).cache;
      
      cache.set('key1', { data: 'test1' });
      cache.set('key2', { data: 'test2' });

      cache.clear();

      expect(cache.cache.size).toBe(0);
    });
  });
});
