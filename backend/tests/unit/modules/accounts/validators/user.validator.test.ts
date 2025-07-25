/**
 * Unit tests for User Validators
 */

// External packages
import { describe, it, expect } from 'vitest';

// Internal modules
import { 
  createUserSchema,
  createUserFromOAuthSchema,
  updateUserSchema,
  userIdParamSchema,
  userFilterSchema
} from '@modules/accounts/validators/user.validator';
import { UserRole } from '@modules/accounts/types/auth.types';

describe.skip('User Validators', () => {
  describe('createUserSchema', () => {
    it('should validate a valid user creation payload', () => {
      const validPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'INVESTOR'
      };

      const result = createUserSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid email', () => {
      const invalidPayload = {
        email: 'invalid-email',
        fullName: 'Test User'
      };

      const result = createUserSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject an empty full name', () => {
      const invalidPayload = {
        email: 'test@example.com',
        fullName: ''
      };

      const result = createUserSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject when providerId is present but authProvider is missing', () => {
      const invalidPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        providerId: 'provider-123'
      };

      const result = createUserSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should accept when both providerId and authProvider are present', () => {
      const validPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        providerId: 'provider-123',
        authProvider: 'GOOGLE'
      };

      const result = createUserSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });
  });

  describe('createUserFromOAuthSchema', () => {
    it('should validate a valid OAuth user creation payload', () => {
      const validPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        providerId: 'provider-123',
        authProvider: 'GOOGLE',
        role: 'INVESTOR'
      };

      const result = createUserFromOAuthSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should validate a minimal valid OAuth user creation payload', () => {
      const validPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        providerId: 'provider-123',
        authProvider: 'GOOGLE'
      };

      const result = createUserFromOAuthSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid email', () => {
      const invalidPayload = {
        email: 'invalid-email',
        fullName: 'Test User',
        providerId: 'provider-123',
        authProvider: 'GOOGLE'
      };

      const result = createUserFromOAuthSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject an empty full name', () => {
      const invalidPayload = {
        email: 'test@example.com',
        fullName: '',
        providerId: 'provider-123',
        authProvider: 'GOOGLE'
      };

      const result = createUserFromOAuthSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject when providerId is missing', () => {
      const invalidPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        authProvider: 'GOOGLE'
      };

      const result = createUserFromOAuthSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject when authProvider is missing', () => {
      const invalidPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        providerId: 'provider-123'
      };

      const result = createUserFromOAuthSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject unknown fields', () => {
      const invalidPayload = {
        email: 'test@example.com',
        fullName: 'Test User',
        providerId: 'provider-123',
        authProvider: 'GOOGLE',
        unknownField: 'some value'
      };

      const result = createUserFromOAuthSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('updateUserSchema', () => {
    it('should validate a valid user update payload', () => {
      const validPayload = {
        fullName: 'Updated Name',
        email: 'updated@example.com'
      };

      const result = updateUserSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid email', () => {
      const invalidPayload = {
        email: 'invalid-email'
      };

      const result = updateUserSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject an empty full name', () => {
      const invalidPayload = {
        fullName: ''
      };

      const result = updateUserSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject unknown fields', () => {
      const invalidPayload = {
        fullName: 'Valid Name',
        unknownField: 'some value'
      };

      const result = updateUserSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('userIdParamSchema', () => {
    it('should validate a valid UUID', () => {
      const validPayload = {
        userId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = userIdParamSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid UUID', () => {
      const invalidPayload = {
        userId: 'not-a-uuid'
      };

      const result = userIdParamSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('userFilterSchema', () => {
    it('should validate a valid filter', () => {
      const validPayload = {
        role: 'ADMIN',
        search: 'test',
        page: 1,
        limit: 10
      };

      const result = userFilterSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid role', () => {
      const invalidPayload = {
        role: 'INVALID_ROLE'
      };

      const result = userFilterSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject a negative page number', () => {
      const invalidPayload = {
        page: -1
      };

      const result = userFilterSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject a limit greater than 100', () => {
      const invalidPayload = {
        limit: 101
      };

      const result = userFilterSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });
});