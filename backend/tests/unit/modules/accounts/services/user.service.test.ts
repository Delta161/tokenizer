/**
 * Unit tests for User Service
 */

// External packages
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Internal modules
import { UserService } from '../../../../../src/modules/accounts/services/user.service';
import { UserRole } from '../../../../../src/modules/accounts/types/auth.types';
import { createNotFound, createBadRequest } from '../../../../../src/middleware/errorHandler';

// Mock the PrismaClient
vi.mock('@prisma/client', () => {
  const PrismaClient = vi.fn();
  PrismaClient.prototype.user = {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return { PrismaClient };
});

// Mock the error handler
vi.mock('@middleware/errorHandler', () => ({
  createNotFound: vi.fn().mockImplementation((message) => new Error(message)),
  createBadRequest: vi.fn().mockImplementation((message) => new Error(message)),
}));

describe.skip('UserService', () => {
  let userService: UserService;
  let mockPrisma: PrismaClient;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    userService = new UserService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return users with pagination and total count', async () => {
      // Mock data
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          fullName: 'User One',
          role: 'INVESTOR',
          authProvider: 'GOOGLE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          fullName: 'User Two',
          role: 'ADMIN',
          authProvider: 'GOOGLE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockTotal = 2;

      // Setup mocks
      mockPrisma.user.findMany = vi.fn().mockResolvedValue(mockUsers);
      mockPrisma.user.count = vi.fn().mockResolvedValue(mockTotal);

      // Call the method
      const result = await userService.getUsers(1, 10);

      // Assertions
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          authProvider: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockPrisma.user.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        users: mockUsers,
        total: mockTotal,
      });
    });

    it('should apply filters correctly', async () => {
      // Mock data
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          fullName: 'User One',
          role: 'ADMIN',
          authProvider: 'GOOGLE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockTotal = 1;

      // Setup mocks
      mockPrisma.user.findMany = vi.fn().mockResolvedValue(mockUsers);
      mockPrisma.user.count = vi.fn().mockResolvedValue(mockTotal);

      // Create filter
      const filters = {
        role: 'ADMIN' as UserRole,
        search: 'user',
        createdAfter: new Date('2023-01-01'),
        createdBefore: new Date('2023-12-31'),
      };

      // Call the method
      const result = await userService.getUsers(1, 10, filters);

      // Assertions
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          role: 'ADMIN',
          OR: [
            { fullName: { contains: 'user', mode: 'insensitive' } },
            { email: { contains: 'user', mode: 'insensitive' } },
          ],
          createdAt: {
            gte: filters.createdAfter,
            lte: filters.createdBefore,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          authProvider: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual({
        users: mockUsers,
        total: mockTotal,
      });
    });

    it('should apply sorting correctly', async () => {
      // Mock data
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          fullName: 'User One',
          role: 'INVESTOR',
          authProvider: 'GOOGLE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockTotal = 1;

      // Setup mocks
      mockPrisma.user.findMany = vi.fn().mockResolvedValue(mockUsers);
      mockPrisma.user.count = vi.fn().mockResolvedValue(mockTotal);

      // Create sort options
      const sort = {
        field: 'email',
        direction: 'asc' as const,
      };

      // Call the method
      const result = await userService.getUsers(1, 10, undefined, sort);

      // Assertions
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { email: 'asc' },
        skip: 0,
        take: 10,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          authProvider: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual({
        users: mockUsers,
        total: mockTotal,
      });
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      // Mock data
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'INVESTOR',
        authProvider: 'GOOGLE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup mock
      mockPrisma.user.findUnique = vi.fn().mockResolvedValue(mockUser);

      // Call the method
      const result = await userService.getUserById('user-id');

      // Assertions
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          authProvider: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw an error when user is not found', async () => {
      // Setup mock to return null (user not found)
      mockPrisma.user.findUnique = vi.fn().mockResolvedValue(null);

      // Call the method and expect it to throw
      await expect(userService.getUserById('non-existent-id')).rejects.toThrow('User not found');

      // Verify the mock was called
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          authProvider: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Mock data
      const userData = {
        email: 'new@example.com',
        fullName: 'New User',
        role: 'INVESTOR' as UserRole,
        authProvider: 'GOOGLE',
        providerId: 'google-123',
      };

      const createdUser = {
        id: 'new-user-id',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup mocks
      mockPrisma.user.findUnique = vi.fn().mockResolvedValue(null); // No existing user
      mockPrisma.user.create = vi.fn().mockResolvedValue(createdUser);

      // Call the method
      const result = await userService.createUser(userData);

      // Assertions
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: userData,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          authProvider: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw an error if email already exists', async () => {
      // Mock data
      const userData = {
        email: 'existing@example.com',
        fullName: 'New User',
        role: 'INVESTOR' as UserRole,
      };

      const existingUser = {
        id: 'existing-user-id',
        email: userData.email,
        fullName: 'Existing User',
        role: 'INVESTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup mock to return an existing user
      mockPrisma.user.findUnique = vi.fn().mockResolvedValue(existingUser);

      // Call the method and expect it to throw
      await expect(userService.createUser(userData)).rejects.toThrow('User with this email already exists');

      // Verify the mock was called
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      // Mock data
      const userId = 'user-id';
      const updateData = {
        fullName: 'Updated Name',
      };

      const existingUser = {
        id: userId,
        email: 'test@example.com',
        fullName: 'Original Name',
        role: 'INVESTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...existingUser,
        fullName: updateData.fullName,
        updatedAt: new Date(),
      };

      // Setup mocks
      mockPrisma.user.findUnique = vi.fn().mockResolvedValue(existingUser);
      mockPrisma.user.update = vi.fn().mockResolvedValue(updatedUser);

      // Call the method
      const result = await userService.updateUser(userId, updateData);

      // Assertions
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error if user is not found', async () => {
      // Setup mock to return null (user not found)
      mockPrisma.user.findUnique = vi.fn().mockResolvedValue(null);

      // Call the method and expect it to throw
      await expect(userService.updateUser('non-existent-id', { fullName: 'New Name' })).rejects.toThrow('User not found');

      // Verify the mock was called
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw an error if updating email to one that already exists', async () => {
      // Mock data
      const userId = 'user-id';
      const updateData = {
        email: 'existing@example.com',
      };

      const existingUser = {
        id: userId,
        email: 'original@example.com',
        fullName: 'Test User',
        role: 'INVESTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const emailTakenUser = {
        id: 'other-user-id',
        email: updateData.email,
        fullName: 'Other User',
        role: 'INVESTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup mocks
      mockPrisma.user.findUnique = vi.fn()
        .mockImplementationOnce(() => Promise.resolve(existingUser)) // First call for user existence
        .mockImplementationOnce(() => Promise.resolve(emailTakenUser)); // Second call for email check

      // Call the method and expect it to throw
      await expect(userService.updateUser(userId, updateData)).rejects.toThrow('Email is already taken');

      // Verify the mocks were called
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrisma.user.findUnique).toHaveBeenNthCalledWith(1, {
        where: { id: userId },
      });
      expect(mockPrisma.user.findUnique).toHaveBeenNthCalledWith(2, {
        where: { email: updateData.email },
      });
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      // Mock data
      const userId = 'user-id';
      const existingUser = {
        id: userId,
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'INVESTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup mocks
      mockPrisma.user.findUnique = vi.fn().mockResolvedValue(existingUser);
      mockPrisma.user.delete = vi.fn().mockResolvedValue(undefined);

      // Call the method
      await userService.deleteUser(userId);

      // Assertions
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw an error if user is not found', async () => {
      // Setup mock to return null (user not found)
      mockPrisma.user.findUnique = vi.fn().mockResolvedValue(null);

      // Call the method and expect it to throw
      await expect(userService.deleteUser('non-existent-id')).rejects.toThrow('User not found');

      // Verify the mock was called
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });
  });
});