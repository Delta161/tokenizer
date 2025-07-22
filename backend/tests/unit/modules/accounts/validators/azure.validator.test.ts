/**
 * Unit tests for Azure Validator
 */

// External packages
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Internal modules
import {
  AzureProfileSchema,
  AzureEmailSchema,
  AzurePlaceholderEmailSchema,
  AzureFullNameSchema,
  AzureUserCreationSchema,
  AzureErrorSchema
} from '@modules/accounts/validators/azure.validator';
import { UserRole } from '@modules/accounts/types/auth.types';

describe('Azure Validator', () => {
  describe('AzureProfileSchema', () => {
    it('should validate a complete Azure profile', () => {
      const validProfile = {
        oid: 'azure-oid-123',
        displayName: 'Test User',
        givenName: 'Test',
        surname: 'User',
        mail: 'test@example.com',
        userPrincipalName: 'test@example.com',
        provider: 'azure-ad',
        _json: { some: 'data' }
      };

      const result = AzureProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validProfile);
      }
    });

    it('should validate a minimal Azure profile', () => {
      const minimalProfile = {
        oid: 'azure-oid-123',
        provider: 'azure-ad'
      };

      const result = AzureProfileSchema.safeParse(minimalProfile);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(minimalProfile);
      }
    });

    it('should reject a profile with missing oid', () => {
      const invalidProfile = {
        provider: 'azure-ad'
      };

      const result = AzureProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Provider ID (oid) is required');
      }
    });

    it('should reject a profile with invalid provider', () => {
      const invalidProfile = {
        oid: 'azure-oid-123',
        provider: 'google'
      };

      const result = AzureProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid literal value');
      }
    });

    it('should reject a profile with invalid email format', () => {
      const invalidProfile = {
        oid: 'azure-oid-123',
        provider: 'azure-ad',
        mail: 'invalid-email'
      };

      const result = AzureProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email format');
      }
    });
  });

  describe('AzureEmailSchema', () => {
    it('should validate and transform a valid email', () => {
      const validEmail = 'Test.User@Example.com';
      const result = AzureEmailSchema.safeParse(validEmail);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test.user@example.com');
      }
    });

    it('should reject an invalid email format', () => {
      const invalidEmail = 'not-an-email';
      const result = AzureEmailSchema.safeParse(invalidEmail);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email format');
      }
    });

    it('should reject an email without @ symbol', () => {
      const invalidEmail = 'testexample.com';
      const result = AzureEmailSchema.safeParse(invalidEmail);
      
      expect(result.success).toBe(false);
    });
  });

  describe('AzurePlaceholderEmailSchema', () => {
    it('should generate a placeholder email from providerId', () => {
      const input = { providerId: 'azure-oid-123' };
      const result = AzurePlaceholderEmailSchema.safeParse(input);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('azure-azureoid123@placeholder.azure.auth');
      }
    });

    it('should sanitize special characters from providerId', () => {
      const input = { providerId: 'azure-oid-123!@#$%^&*()' };
      const result = AzurePlaceholderEmailSchema.safeParse(input);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('azure-azureoid123@placeholder.azure.auth');
      }
    });

    it('should reject input with missing providerId', () => {
      const invalidInput = {};
      const result = AzurePlaceholderEmailSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Provider ID is required');
      }
    });

    it('should reject input with empty providerId', () => {
      const invalidInput = { providerId: '' };
      const result = AzurePlaceholderEmailSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Provider ID is required');
      }
    });
  });

  describe('AzureFullNameSchema', () => {
    it('should combine firstName and lastName', () => {
      const input = {
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User Display',
        email: 'test@example.com'
      };
      const result = AzureFullNameSchema.safeParse(input);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Test User');
      }
    });

    it('should use displayName when firstName and lastName are missing', () => {
      const input = {
        displayName: 'Test User Display',
        email: 'test@example.com'
      };
      const result = AzureFullNameSchema.safeParse(input);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Test User Display');
      }
    });

    it('should use email prefix when name fields are missing', () => {
      const input = {
        email: 'test.user@example.com'
      };
      const result = AzureFullNameSchema.safeParse(input);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Test User');
      }
    });

    it('should use default placeholder when all name sources are missing', () => {
      const input = {};
      const result = AzureFullNameSchema.safeParse(input);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Azure User');
      }
    });

    it('should truncate names longer than 255 characters', () => {
      const longName = 'A'.repeat(300);
      const input = {
        firstName: longName
      };
      const result = AzureFullNameSchema.safeParse(input);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(255);
      }
    });
  });

  describe('AzureUserCreationSchema', () => {
    it('should validate a complete user creation payload', () => {
      const validPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        providerId: 'azure-oid-123',
        avatarUrl: 'https://example.com/avatar.jpg',
        role: 'INVESTOR',
        authProvider: 'AZURE'
      };

      const result = AzureUserCreationSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPayload);
      }
    });

    it('should validate a minimal user creation payload', () => {
      const minimalPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        providerId: 'azure-oid-123',
        authProvider: 'AZURE'
      };

      const result = AzureUserCreationSchema.safeParse(minimalPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          ...minimalPayload,
          role: 'INVESTOR'
        });
      }
    });

    it('should reject payload with invalid email', () => {
      const invalidPayload = {
        email: 'invalid-email',
        fullName: 'Test User',
        providerId: 'azure-oid-123',
        authProvider: 'AZURE'
      };

      const result = AzureUserCreationSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email format');
      }
    });

    it('should reject payload with missing fullName', () => {
      const invalidPayload = {
        email: 'test@example.com',
        fullName: '',
        providerId: 'azure-oid-123',
        authProvider: 'AZURE'
      };

      const result = AzureUserCreationSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Full name is required');
      }
    });

    it('should reject payload with missing providerId', () => {
      const invalidPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        providerId: '',
        authProvider: 'AZURE'
      };

      const result = AzureUserCreationSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Provider ID is required');
      }
    });

    it('should reject payload with invalid authProvider', () => {
      const invalidPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        providerId: 'azure-oid-123',
        authProvider: 'GOOGLE'
      };

      const result = AzureUserCreationSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid literal value');
      }
    });

    it('should reject payload with invalid avatarUrl', () => {
      const invalidPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        providerId: 'azure-oid-123',
        avatarUrl: 'not-a-url',
        authProvider: 'AZURE'
      };

      const result = AzureUserCreationSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid avatar URL');
      }
    });

    it('should reject payload with unknown fields', () => {
      const invalidPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        providerId: 'azure-oid-123',
        authProvider: 'AZURE',
        unknownField: 'some value'
      };

      const result = AzureUserCreationSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('unrecognized_keys');
      }
    });
  });

  describe('AzureErrorSchema', () => {
    it('should transform Prisma email uniqueness error', () => {
      const error = {
        code: 'P2002',
        meta: { target: ['email'] },
        message: 'Unique constraint failed on the fields: (`email`)',
        email: 'test@example.com'
      };

      const result = AzureErrorSchema.safeParse(error);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          message: 'A user with this email already exists',
          action: 'FIND_BY_EMAIL'
        });
      }
    });

    it('should transform Prisma providerId uniqueness error', () => {
      const error = {
        code: 'P2002',
        meta: { target: ['providerId'] },
        message: 'Unique constraint failed on the fields: (`providerId`)',
        providerId: 'azure-oid-123'
      };

      const result = AzureErrorSchema.safeParse(error);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          message: 'A user with this provider ID already exists',
          action: 'FIND_BY_PROVIDER_ID'
        });
      }
    });

    it('should transform Prisma string length error', () => {
      const error = {
        code: 'P2000',
        meta: { target: 'email' },
        message: 'The provided value for the column is too long for the column\'s type',
        email: 'very-long-email@example.com'
      };

      const result = AzureErrorSchema.safeParse(error);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          message: 'Email address is too long',
          action: 'NONE'
        });
      }
    });

    it('should transform missing fields error', () => {
      const error = {
        message: 'Missing required fields in profile',
        providerId: 'azure-oid-123'
      };

      const result = AzureErrorSchema.safeParse(error);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          message: 'Your profile is missing required information',
          action: 'NONE'
        });
      }
    });

    it('should transform invalid email error', () => {
      const error = {
        message: 'Invalid email format',
        email: 'invalid-email'
      };

      const result = AzureErrorSchema.safeParse(error);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          message: 'Your profile contains an invalid email format',
          action: 'NONE'
        });
      }
    });

    it('should provide default message for unknown errors', () => {
      const error = {
        code: 'UNKNOWN',
        message: 'Some unknown error'
      };

      const result = AzureErrorSchema.safeParse(error);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          message: 'Failed to authenticate with Azure',
          action: 'NONE'
        });
      }
    });
  });
});