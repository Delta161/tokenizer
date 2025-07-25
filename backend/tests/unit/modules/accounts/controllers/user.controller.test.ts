/**
 * Unit tests for User Controller
 */

// External packages
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';

// Internal modules
import { UserController } from '@modules/accounts/controllers/user.controller';
import { userService } from '@modules/accounts/services/user.service';
import { UserRole } from '@modules/accounts/types/auth.types';
import { createUserSchema, updateUserSchema, userFilterSchema, userIdParamSchema } from '@modules/accounts/validators/user.validator';

// Mock the userService
vi.mock('@modules/accounts/services/user.service', () => ({
  userService: {
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

// Mock the validators
vi.mock('@modules/accounts/validators/user.validator', () => ({
  createUserSchema: {
    parse: vi.fn(),
  },
  updateUserSchema: {
    parse: vi.fn(),
  },
  userFilterSchema: {
    parse: vi.fn(),
  },
  userIdParamSchema: {
    parse: vi.fn(),
  },
}));

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    userController = new UserController();
    
    mockRequest = {
      query: {},
      params: {},
      body: {},
      path: '',
    };
    
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      end: vi.fn(),
    };
    
    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should get users with pagination and return them', async () => {
      // Mock data
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          fullName: 'User One',
          role: 'INVESTOR',
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          fullName: 'User Two',
          role: 'ADMIN',
        },
      ];
      const mockTotal = 2;
      const mockValidatedQuery = {
        page: 1,
        limit: 10,
      };

      // Setup mocks
      userFilterSchema.parse = vi.fn().mockReturnValue(mockValidatedQuery);
      userService.getUsers = vi.fn().mockResolvedValue({ users: mockUsers, total: mockTotal });

      // Call the method
      await userController.getUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(userFilterSchema.parse).toHaveBeenCalledWith(mockRequest.query);
      expect(userService.getUsers).toHaveBeenCalledWith(1, 10, {}, undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
        meta: expect.objectContaining({
          currentPage: 1,
          totalPages: expect.any(Number),
          totalItems: mockTotal,
          itemsPerPage: 10,
          hasNextPage: expect.any(Boolean),
          hasPrevPage: expect.any(Boolean),
        }),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next middleware', async () => {
      // Setup mock to throw an error
      const mockError = new Error('Test error');
      userFilterSchema.parse = vi.fn().mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      await userController.getUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should get a user by ID and return it', async () => {
      // Mock data
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'INVESTOR',
      };
      const mockParams = { userId: 'user-id' };

      // Setup mocks
      mockRequest.params = mockParams;
      userIdParamSchema.parse = vi.fn().mockReturnValue(mockParams);
      userService.getUserById = vi.fn().mockResolvedValue(mockUser);

      // Call the method
      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(userIdParamSchema.parse).toHaveBeenCalledWith(mockParams);
      expect(userService.getUserById).toHaveBeenCalledWith('user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ user: mockUser });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should get the profile of the authenticated user', async () => {
      // Mock data
      const mockUser = {
        id: 'auth-user-id',
        email: 'auth@example.com',
        fullName: 'Auth User',
        role: 'INVESTOR',
      };
      
      // Setup mocks
      mockRequest.path = '/profile';
      mockRequest.user = { id: 'auth-user-id' };
      userService.getUserById = vi.fn().mockResolvedValue(mockUser);

      // Call the method
      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(userIdParamSchema.parse).not.toHaveBeenCalled();
      expect(userService.getUserById).toHaveBeenCalledWith('auth-user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ user: mockUser });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next middleware', async () => {
      // Setup mock to throw an error
      const mockError = new Error('Test error');
      userIdParamSchema.parse = vi.fn().mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create a user and return it with 201 status', async () => {
      // Mock data
      const mockUserData = {
        email: 'new@example.com',
        fullName: 'New User',
        role: 'INVESTOR' as UserRole,
      };
      const mockCreatedUser = {
        id: 'new-user-id',
        ...mockUserData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup mocks
      mockRequest.body = mockUserData;
      createUserSchema.parse = vi.fn().mockReturnValue(mockUserData);
      userService.createUser = vi.fn().mockResolvedValue(mockCreatedUser);

      // Call the method
      await userController.createUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(createUserSchema.parse).toHaveBeenCalledWith(mockUserData);
      expect(userService.createUser).toHaveBeenCalledWith(mockUserData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ user: mockCreatedUser });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next middleware', async () => {
      // Setup mock to throw an error
      const mockError = new Error('Test error');
      createUserSchema.parse = vi.fn().mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      await userController.createUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update a user by ID and return it', async () => {
      // Mock data
      const mockParams = { userId: 'user-id' };
      const mockUpdateData = {
        fullName: 'Updated Name',
      };
      const mockUpdatedUser = {
        id: 'user-id',
        email: 'test@example.com',
        fullName: 'Updated Name',
        role: 'INVESTOR',
        updatedAt: new Date(),
      };

      // Setup mocks
      mockRequest.params = mockParams;
      mockRequest.body = mockUpdateData;
      userIdParamSchema.parse = vi.fn().mockReturnValue(mockParams);
      updateUserSchema.parse = vi.fn().mockReturnValue(mockUpdateData);
      userService.updateUser = vi.fn().mockResolvedValue(mockUpdatedUser);

      // Call the method
      await userController.updateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(userIdParamSchema.parse).toHaveBeenCalledWith(mockParams);
      expect(updateUserSchema.parse).toHaveBeenCalledWith(mockUpdateData);
      expect(userService.updateUser).toHaveBeenCalledWith('user-id', mockUpdateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ user: mockUpdatedUser });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should update the profile of the authenticated user', async () => {
      // Mock data
      const mockUpdateData = {
        fullName: 'Updated Name',
        role: 'ADMIN', // This should be removed for profile updates
      };
      const expectedUpdateData = {
        fullName: 'Updated Name',
      };
      const mockUpdatedUser = {
        id: 'auth-user-id',
        email: 'auth@example.com',
        fullName: 'Updated Name',
        role: 'INVESTOR', // Role should not be updated
        updatedAt: new Date(),
      };

      // Setup mocks
      mockRequest.path = '/profile';
      mockRequest.user = { id: 'auth-user-id' };
      mockRequest.body = mockUpdateData;
      updateUserSchema.parse = vi.fn().mockReturnValue(mockUpdateData);
      userService.updateUser = vi.fn().mockResolvedValue(mockUpdatedUser);

      // Call the method
      await userController.updateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(userIdParamSchema.parse).not.toHaveBeenCalled();
      expect(updateUserSchema.parse).toHaveBeenCalledWith(mockUpdateData);
      expect(userService.updateUser).toHaveBeenCalledWith('auth-user-id', expectedUpdateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ user: mockUpdatedUser });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next middleware', async () => {
      // Setup mock to throw an error
      const mockError = new Error('Test error');
      updateUserSchema.parse = vi.fn().mockImplementation(() => {
        throw mockError;
      });

      // Set up the user in the request
      mockRequest.user = { id: 'auth-user-id' };
      mockRequest.path = '/profile';

      // Call the method
      await userController.updateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return 204 status', async () => {
      // Mock data
      const mockParams = { userId: 'user-id' };

      // Setup mocks
      mockRequest.params = mockParams;
      userIdParamSchema.parse = vi.fn().mockReturnValue(mockParams);
      userService.deleteUser = vi.fn().mockResolvedValue(undefined);

      // Call the method
      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(userIdParamSchema.parse).toHaveBeenCalledWith(mockParams);
      expect(userService.deleteUser).toHaveBeenCalledWith('user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next middleware', async () => {
      // Setup mock to throw an error
      const mockError = new Error('Test error');
      userIdParamSchema.parse = vi.fn().mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.end).not.toHaveBeenCalled();
    });
  });
});