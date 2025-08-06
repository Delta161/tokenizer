/**
 * Unit tests for Auth Service
 */

// External packages
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Internal modules
import { AuthService } from '@modules/accounts/services/auth.service';
import type { OAuthProfileDTO } from '@modules/accounts/types/auth.types';

// Mock the PrismaClient
vi.mock('@prisma/client', () => {
  const PrismaClient = vi.fn();
  PrismaClient.prototype.user = {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  return { PrismaClient };
});

// Mock the OAuth profile mapper
vi.mock('@modules/accounts/utils/oauthProfileMapper', () => ({
  mapOAuthProfile: vi.fn().mockReturnValue({
    provider: 'google',
    providerId: 'google-id-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
  }),
  validateNormalizedProfile: vi.fn().mockReturnValue(true),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: PrismaClient;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    authService = new AuthService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('processOAuthLogin', () => {
    it('should create a new user if not found', async () => {
      // Mock user not found
      mockPrisma.user.findFirst = vi.fn().mockResolvedValue(null);
      mockPrisma.user.findUnique = vi.fn().mockResolvedValue(null);
      
      // Mock user creation
      const mockCreatedUser = {
        id: 'new-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'INVESTOR',
        authProvider: 'GOOGLE',
        providerId: 'google-id-123',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      };
      mockPrisma.user.create = vi.fn().mockResolvedValue(mockCreatedUser);

      // Create a mock OAuth profile
      const mockProfile: OAuthProfileDTO = {
        provider: 'google',
        id: 'google-id-123',
        displayName: 'Test User',
        name: {
          givenName: 'Test',
          familyName: 'User',
        },
        emails: [{ value: 'test@example.com', verified: true }],
        photos: [{ value: 'https://example.com/avatar.jpg' }],
        _json: {},
      };

      // Call the method
      const result = await authService.processOAuthLogin(mockProfile);

      // Assertions
      expect(mockPrisma.user.findFirst).toHaveBeenCalled();
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result).toEqual({
        user: mockCreatedUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });

    it('should update an existing user if found by provider ID', async () => {
      // Mock user found by provider ID
      const mockExistingUser = {
        id: 'existing-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'INVESTOR',
        authProvider: 'GOOGLE',
        providerId: 'google-id-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findFirst = vi.fn().mockResolvedValue(mockExistingUser);
      
      // Mock user update
      const mockUpdatedUser = {
        ...mockExistingUser,
        lastLoginAt: new Date(),
      };
      mockPrisma.user.update = vi.fn().mockResolvedValue(mockUpdatedUser);

      // Create a mock OAuth profile
      const mockProfile: OAuthProfileDTO = {
        provider: 'google',
        id: 'google-id-123',
        displayName: 'Test User',
        name: {
          givenName: 'Test',
          familyName: 'User',
        },
        emails: [{ value: 'test@example.com', verified: true }],
        photos: [{ value: 'https://example.com/avatar.jpg' }],
        _json: {},
      };

      // Call the method
      const result = await authService.processOAuthLogin(mockProfile);

      // Assertions
      expect(mockPrisma.user.findFirst).toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalled();
      expect(result).toEqual({
        user: mockExistingUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });
  });
});