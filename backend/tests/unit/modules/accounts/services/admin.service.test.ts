/**
 * AdminService Unit Tests
 * Tests for the AdminService class with admin operations
 */

import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { AdminService } from '@modules/accounts/services/admin.service';
import { prisma } from '@modules/accounts/utils/prisma';
import { createNotFound, createBadRequest } from '@middleware/errorHandler';
import { UserRole } from '@modules/accounts/types/auth.types';
import { AuthProvider } from '@prisma/client';

// Mock dependencies
vi.mock('@modules/accounts/utils/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    auditLogEntry: {
      create: vi.fn()
    }
  }
}));

vi.mock('@middleware/errorHandler', () => ({
  createNotFound: vi.fn(),
  createBadRequest: vi.fn()
}));

vi.mock('@utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('AdminService', () => {
  let adminService: AdminService;
  const mockPrisma = {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    auditLogEntry: {
      create: vi.fn()
    }
  };

  beforeEach(() => {
    adminService = new AdminService();
    vi.clearAllMocks();
    // Override the mocked prisma with our mock functions
    Object.assign(prisma, mockPrisma);
  });

  describe('getUsers', () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        fullName: 'User One',
        role: 'INVESTOR' as UserRole,
        authProvider: 'GOOGLE' as AuthProvider,
        providerId: 'google-1',
        avatarUrl: null,
        phone: null,
        preferredLanguage: 'en',
        timezone: 'UTC',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        deletedAt: null
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        fullName: 'User Two',
        role: 'CLIENT' as UserRole,
        authProvider: 'AZURE' as AuthProvider,
        providerId: 'azure-2',
        avatarUrl: 'https://example.com/avatar2.jpg',
        phone: '+1234567890',
        preferredLanguage: 'es',
        timezone: 'PST',
        createdAt: new Date('2023-01-03'),
        updatedAt: new Date('2023-01-04'),
        deletedAt: null
      }
    ];

    it('should return users with pagination', async () => {
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);
      mockPrisma.user.count.mockResolvedValue(2);

      const result = await adminService.getUsers(1, 10);

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: undefined,
        select: expect.any(Object)
      });
      expect(mockPrisma.user.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should apply filters correctly', async () => {
      const filters = {
        role: 'INVESTOR' as UserRole,
        search: 'john',
        createdAfter: new Date('2023-01-01'),
        createdBefore: new Date('2023-12-31')
      };

      mockPrisma.user.findMany.mockResolvedValue([mockUsers[0]]);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await adminService.getUsers(1, 10, filters);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          role: 'INVESTOR',
          OR: [
            { fullName: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } }
          ],
          createdAt: {
            gte: filters.createdAfter,
            lte: filters.createdBefore
          }
        },
        skip: 0,
        take: 10,
        orderBy: undefined,
        select: expect.any(Object)
      });
    });

    it('should apply sorting correctly', async () => {
      const sort = {
        field: 'createdAt' as const,
        direction: 'desc' as const
      };

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);
      mockPrisma.user.count.mockResolvedValue(2);

      await adminService.getUsers(1, 10, undefined, sort);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object)
      });
    });
  });

  describe('createUser', () => {
    const createUserData = {
      email: 'newuser@example.com',
      fullName: 'New User',
      authProvider: 'GOOGLE' as AuthProvider,
      providerId: 'google-new'
    };

    const mockCreatedUser = {
      id: 'new-user-id',
      ...createUserData,
      role: 'INVESTOR' as UserRole,
      avatarUrl: null,
      phone: null,
      preferredLanguage: null,
      timezone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };

    it('should create new user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // No existing user
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);
      mockPrisma.auditLogEntry.create.mockResolvedValue({});

      const result = await adminService.createUser(createUserData);

      expect(result).toEqual(mockCreatedUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserData.email }
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserData.email,
          fullName: createUserData.fullName,
          providerId: createUserData.providerId,
          role: undefined,
          authProvider: createUserData.authProvider
        },
        select: expect.any(Object)
      });
    });

    it('should throw error if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockCreatedUser);
      const mockError = new Error('User with this email already exists');
      (createBadRequest as MockedFunction<any>).mockReturnValue(mockError);

      await expect(adminService.createUser(createUserData))
        .rejects.toThrow('User with this email already exists');

      expect(createBadRequest).toHaveBeenCalledWith('User with this email already exists');
    });

    it('should handle missing providerId by generating one', async () => {
      const dataWithoutProviderId = {
        email: 'newuser@example.com',
        fullName: 'New User',
        authProvider: 'GOOGLE' as AuthProvider
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);
      mockPrisma.auditLogEntry.create.mockResolvedValue({});

      await adminService.createUser(dataWithoutProviderId);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dataWithoutProviderId.email,
          fullName: dataWithoutProviderId.fullName,
          providerId: expect.stringContaining('manual-'),
          role: undefined,
          authProvider: dataWithoutProviderId.authProvider
        },
        select: expect.any(Object)
      });
    });

    it('should create audit log entry', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);
      mockPrisma.auditLogEntry.create.mockResolvedValue({});

      await adminService.createUser(createUserData);

      expect(mockPrisma.auditLogEntry.create).toHaveBeenCalledWith({
        data: {
          userId: mockCreatedUser.id,
          adminAction: 'createUser',
          changes: JSON.stringify({
            email: createUserData.email,
            fullName: createUserData.fullName,
            role: 'INVESTOR'
          }),
          timestamp: expect.any(Date)
        }
      });
    });
  });

  describe('updateUser', () => {
    const userId = 'user-123';
    const updateData = {
      fullName: 'Updated Name',
      phone: '+0987654321'
    };

    const mockUpdatedUser = {
      id: userId,
      email: 'user@example.com',
      fullName: 'Updated Name',
      role: 'INVESTOR' as UserRole,
      authProvider: 'GOOGLE' as AuthProvider,
      providerId: 'google-123',
      avatarUrl: null,
      phone: '+0987654321',
      preferredLanguage: 'en',
      timezone: 'UTC',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date(),
      deletedAt: null
    };

    it('should update user successfully', async () => {
      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);
      mockPrisma.auditLogEntry.create.mockResolvedValue({});

      const result = await adminService.updateUser(userId, updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        select: expect.any(Object)
      });
    });

    it('should create audit log entry for update', async () => {
      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);
      mockPrisma.auditLogEntry.create.mockResolvedValue({});

      await adminService.updateUser(userId, updateData);

      expect(mockPrisma.auditLogEntry.create).toHaveBeenCalledWith({
        data: {
          userId: userId,
          adminAction: 'updateUser',
          changes: JSON.stringify(updateData),
          timestamp: expect.any(Date)
        }
      });
    });
  });

  describe('deleteUser', () => {
    const userId = 'user-123';

    it('should delete user successfully', async () => {
      mockPrisma.user.delete.mockResolvedValue({});
      mockPrisma.auditLogEntry.create.mockResolvedValue({});

      await adminService.deleteUser(userId);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId }
      });
    });

    it('should create audit log entry for deletion', async () => {
      mockPrisma.user.delete.mockResolvedValue({});
      mockPrisma.auditLogEntry.create.mockResolvedValue({});

      await adminService.deleteUser(userId);

      expect(mockPrisma.auditLogEntry.create).toHaveBeenCalledWith({
        data: {
          userId: userId,
          adminAction: 'deleteUser',
          changes: JSON.stringify({ deleted: true }),
          timestamp: expect.any(Date)
        }
      });
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockStats = [
        { role: 'INVESTOR', _count: { role: 5 } },
        { role: 'CLIENT', _count: { role: 3 } },
        { role: 'ADMIN', _count: { role: 1 } }
      ];

      mockPrisma.user.count.mockResolvedValueOnce(9); // totalUsers
      (mockPrisma.user.count as any)
        .mockResolvedValueOnce(8) // activeUsers
        .mockResolvedValueOnce(2); // recentUsers

      (mockPrisma.user as any).groupBy = vi.fn().mockResolvedValue(mockStats);

      const result = await adminService.getUserStats();

      expect(result).toEqual({
        totalUsers: 9,
        activeUsers: 8,
        usersByRole: {
          INVESTOR: 5,
          CLIENT: 3,
          ADMIN: 1
        },
        recentUsers: 2
      });
    });
  });
});
