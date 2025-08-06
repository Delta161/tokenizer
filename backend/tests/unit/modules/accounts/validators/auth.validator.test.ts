/**
 * Unit tests for Auth Validators
 */

// External packages
import { describe, it, expect } from 'vitest';

// Internal modules
import {
  OAuthProfileSchema,
  NormalizedProfileSchema,
  RelaxedNormalizedProfileSchema
} from '@modules/accounts/validators/auth.validator';

describe('Auth Validators', () => {
  describe('OAuthProfileSchema', () => {
    it('should validate a complete OAuth profile', () => {
      const completeProfile = {
        provider: 'google',
        id: 'google-id-123',
        displayName: 'Test User',
        name: {
          givenName: 'Test',
          familyName: 'User'
        },
        emails: [
          { value: 'test@example.com', verified: true }
        ],
        photos: [
          { value: 'https://example.com/avatar.jpg' }
        ],
        _json: { raw: 'data' }
      };

      const result = OAuthProfileSchema.safeParse(completeProfile);
      expect(result.success).toBe(true);
    });

    it('should validate a minimal OAuth profile', () => {
      const minimalProfile = {
        provider: 'google',
        id: 'google-id-123'
      };

      const result = OAuthProfileSchema.safeParse(minimalProfile);
      expect(result.success).toBe(true);
    });

    it('should reject a profile without provider', () => {
      const invalidProfile = {
        id: 'google-id-123'
      };

      const result = OAuthProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('provider');
      }
    });

    it('should reject a profile without id', () => {
      const invalidProfile = {
        provider: 'google'
      };

      const result = OAuthProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('id');
      }
    });

    it('should reject a profile with invalid email format', () => {
      const invalidProfile = {
        provider: 'google',
        id: 'google-id-123',
        emails: [
          { value: 'invalid-email' }
        ]
      };

      const result = OAuthProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('emails');
      }
    });

    it('should reject a profile with invalid photo URL', () => {
      const invalidProfile = {
        provider: 'google',
        id: 'google-id-123',
        photos: [
          { value: 'invalid-url' }
        ]
      };

      const result = OAuthProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('photos');
      }
    });
  });

  describe('NormalizedProfileSchema', () => {
    it('should validate a complete normalized profile', () => {
      const completeProfile = {
        provider: 'google',
        providerId: 'google-id-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        role: 'INVESTOR',
        _json: { raw: 'data' }
      };

      const result = NormalizedProfileSchema.safeParse(completeProfile);
      expect(result.success).toBe(true);
    });

    it('should validate a profile with only firstName', () => {
      const profileWithFirstName = {
        provider: 'google',
        providerId: 'google-id-123',
        email: 'test@example.com',
        firstName: 'Test'
      };

      const result = NormalizedProfileSchema.safeParse(profileWithFirstName);
      expect(result.success).toBe(true);
    });

    it('should validate a profile with only lastName', () => {
      const profileWithLastName = {
        provider: 'google',
        providerId: 'google-id-123',
        email: 'test@example.com',
        lastName: 'User'
      };

      const result = NormalizedProfileSchema.safeParse(profileWithLastName);
      expect(result.success).toBe(true);
    });

    it('should validate a profile with only displayName', () => {
      const profileWithDisplayName = {
        provider: 'google',
        providerId: 'google-id-123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      const result = NormalizedProfileSchema.safeParse(profileWithDisplayName);
      expect(result.success).toBe(true);
    });

    it('should reject a profile without provider', () => {
      const invalidProfile = {
        providerId: 'google-id-123',
        email: 'test@example.com',
        firstName: 'Test'
      };

      const result = NormalizedProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('provider');
      }
    });

    it('should reject a profile without providerId', () => {
      const invalidProfile = {
        provider: 'google',
        email: 'test@example.com',
        firstName: 'Test'
      };

      const result = NormalizedProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('providerId');
      }
    });

    it('should reject a profile without email', () => {
      const invalidProfile = {
        provider: 'google',
        providerId: 'google-id-123',
        firstName: 'Test'
      };

      const result = NormalizedProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject a profile with invalid email format', () => {
      const invalidProfile = {
        provider: 'google',
        providerId: 'google-id-123',
        email: 'invalid-email',
        firstName: 'Test'
      };

      const result = NormalizedProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject a profile without any name fields', () => {
      const invalidProfile = {
        provider: 'google',
        providerId: 'google-id-123',
        email: 'test@example.com'
      };

      const result = NormalizedProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('firstName');
      }
    });

    it('should reject a profile with invalid avatar URL', () => {
      const invalidProfile = {
        provider: 'google',
        providerId: 'google-id-123',
        email: 'test@example.com',
        firstName: 'Test',
        avatarUrl: 'invalid-url'
      };

      const result = NormalizedProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('avatarUrl');
      }
    });

    it('should reject a profile with invalid role', () => {
      const invalidProfile = {
        provider: 'google',
        providerId: 'google-id-123',
        email: 'test@example.com',
        firstName: 'Test',
        role: 'INVALID_ROLE'
      };

      const result = NormalizedProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('role');
      }
    });
  });

  describe('RelaxedNormalizedProfileSchema', () => {
    it('should validate a complete profile', () => {
      const completeProfile = {
        provider: 'google',
        providerId: 'google-id-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        role: 'INVESTOR',
        _json: { raw: 'data' }
      };

      const result = RelaxedNormalizedProfileSchema.safeParse(completeProfile);
      expect(result.success).toBe(true);
    });

    it('should validate a minimal profile with only required fields', () => {
      const minimalProfile = {
        provider: 'google',
        providerId: 'google-id-123'
      };

      const result = RelaxedNormalizedProfileSchema.safeParse(minimalProfile);
      expect(result.success).toBe(true);
    });

    it('should reject a profile without provider', () => {
      const invalidProfile = {
        providerId: 'google-id-123'
      };

      const result = RelaxedNormalizedProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('provider');
      }
    });

    it('should reject a profile without providerId', () => {
      const invalidProfile = {
        provider: 'google'
      };

      const result = RelaxedNormalizedProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('providerId');
      }
    });

    it('should accept a profile with invalid email format', () => {
      const profileWithInvalidEmail = {
        provider: 'google',
        providerId: 'google-id-123',
        email: 'invalid-email'
      };

      const result = RelaxedNormalizedProfileSchema.safeParse(profileWithInvalidEmail);
      expect(result.success).toBe(true);
    });

    it('should accept a profile with invalid avatar URL', () => {
      const profileWithInvalidAvatar = {
        provider: 'google',
        providerId: 'google-id-123',
        avatarUrl: 'invalid-url'
      };

      const result = RelaxedNormalizedProfileSchema.safeParse(profileWithInvalidAvatar);
      expect(result.success).toBe(true);
    });

    it('should accept a profile with invalid role', () => {
      const profileWithInvalidRole = {
        provider: 'google',
        providerId: 'google-id-123',
        role: 'INVALID_ROLE'
      };

      const result = RelaxedNormalizedProfileSchema.safeParse(profileWithInvalidRole);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('role');
      }
    });
  });
});