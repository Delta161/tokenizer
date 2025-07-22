/**
 * Unit tests for OAuth Profile Mapper
 */

// External packages
import { describe, it, expect } from 'vitest';

// Internal modules
import { 
  mapGoogleProfile, 
  mapAzureProfile, 
  mapOAuthProfile, 
  validateNormalizedProfile 
} from '@modules/accounts/utils/oauthProfileMapper';
import type { GoogleProfile, AzureProfile, NormalizedProfile } from '@modules/accounts/utils/oauthProfileMapper';
import { NormalizedProfileSchema, RelaxedNormalizedProfileSchema } from '@modules/accounts/validators/auth.validator';

describe('OAuth Profile Mapper', () => {
  describe('mapGoogleProfile', () => {
    it('should correctly map a Google profile', () => {
      // Create a mock Google profile
      const mockGoogleProfile: GoogleProfile = {
        id: 'google-id-123',
        displayName: 'Test User',
        name: {
          givenName: 'Test',
          familyName: 'User',
        },
        emails: [{ value: 'test@example.com', verified: true }],
        photos: [{ value: 'https://example.com/avatar.jpg' }],
        provider: 'google',
      };

      // Call the mapper
      const result = mapGoogleProfile(mockGoogleProfile);

      // Assertions
      expect(result).toEqual({
        providerId: 'google-id-123',
        provider: 'google',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        role: 'INVESTOR',
      });
    });

    it('should handle missing optional fields', () => {
      // Create a minimal Google profile
      const minimalGoogleProfile: GoogleProfile = {
        id: 'google-id-123',
        provider: 'google',
      };

      // Call the mapper
      const result = mapGoogleProfile(minimalGoogleProfile);

      // Assertions
      expect(result).toEqual({
        providerId: 'google-id-123',
        provider: 'google',
        email: '',
        firstName: '',
        lastName: '',
        displayName: undefined,
        avatarUrl: undefined,
        role: 'INVESTOR',
      });
    });
  });

  describe('mapAzureProfile', () => {
    it('should correctly map an Azure profile', () => {
      // Create a mock Azure profile
      const mockAzureProfile: AzureProfile = {
        oid: 'azure-oid-123',
        displayName: 'Test User',
        givenName: 'Test',
        surname: 'User',
        mail: 'test@example.com',
        userPrincipalName: 'test@example.com',
        provider: 'azure-ad',
      };

      // Call the mapper
      const result = mapAzureProfile(mockAzureProfile);

      // Assertions
      expect(result).toEqual({
        providerId: 'azure-oid-123',
        provider: 'azure',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        role: 'INVESTOR',
      });
    });

    it('should handle missing optional fields', () => {
      // Create a minimal Azure profile
      const minimalAzureProfile: AzureProfile = {
        oid: 'azure-oid-123',
        provider: 'azure-ad',
      };

      // Call the mapper
      const result = mapAzureProfile(minimalAzureProfile);

      // Assertions
      expect(result).toEqual({
        providerId: 'azure-oid-123',
        provider: 'azure',
        email: '',
        firstName: '',
        lastName: '',
        displayName: undefined,
        role: 'INVESTOR',
      });
    });

    it('should use userPrincipalName if mail is not available', () => {
      // Create an Azure profile with userPrincipalName but no mail
      const azureProfileWithUPN: AzureProfile = {
        oid: 'azure-oid-123',
        userPrincipalName: 'test@example.com',
        provider: 'azure-ad',
      };

      // Call the mapper
      const result = mapAzureProfile(azureProfileWithUPN);

      // Assertions
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('mapOAuthProfile', () => {
    it('should map a Google profile', () => {
      // Create a mock profile
      const mockProfile = {
        id: 'google-id-123',
        displayName: 'Test User',
        name: {
          givenName: 'Test',
          familyName: 'User',
        },
        emails: [{ value: 'test@example.com', verified: true }],
        photos: [{ value: 'https://example.com/avatar.jpg' }],
        provider: 'google',
      };

      // Call the mapper
      const result = mapOAuthProfile(mockProfile, 'google');

      // Assertions
      expect(result.provider).toBe('google');
      expect(result.providerId).toBe('google-id-123');
    });

    it('should map an Azure profile', () => {
      // Create a mock profile
      const mockProfile = {
        oid: 'azure-oid-123',
        displayName: 'Test User',
        givenName: 'Test',
        surname: 'User',
        mail: 'test@example.com',
        provider: 'azure-ad',
      };

      // Call the mapper
      const result = mapOAuthProfile(mockProfile, 'azure-ad');

      // Assertions
      expect(result.provider).toBe('azure');
      expect(result.providerId).toBe('azure-oid-123');
    });

    it('should throw an error for unsupported providers', () => {
      // Create a mock profile
      const mockProfile = {
        id: 'unknown-id-123',
        provider: 'unknown',
      };

      // Call the mapper and expect it to throw
      expect(() => mapOAuthProfile(mockProfile, 'unknown')).toThrow('Unsupported OAuth provider: unknown');
    });
  });

  describe('validateNormalizedProfile (deprecated)', () => {
    it('should validate a complete profile', () => {
      // Create a complete normalized profile
      const completeProfile: NormalizedProfile = {
        providerId: 'provider-id-123',
        provider: 'google',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      // Validate the profile
      const result = validateNormalizedProfile(completeProfile);

      // Assertions
      expect(result).toBe(true);
    });

    it('should validate a profile with minimal required fields', () => {
      // Create a minimal normalized profile
      const minimalProfile: NormalizedProfile = {
        providerId: 'provider-id-123',
        provider: 'google',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: '',
      };

      // Validate the profile
      const result = validateNormalizedProfile(minimalProfile);

      // Assertions
      expect(result).toBe(true);
    });

    it('should reject a profile without providerId', () => {
      // Create an invalid profile missing providerId
      const invalidProfile = {
        provider: 'google',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      } as NormalizedProfile;

      // Validate the profile
      const result = validateNormalizedProfile(invalidProfile);

      // Assertions
      expect(result).toBe(false);
    });

    it('should reject a profile without provider', () => {
      // Create an invalid profile missing provider
      const invalidProfile = {
        providerId: 'provider-id-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      } as NormalizedProfile;

      // Validate the profile
      const result = validateNormalizedProfile(invalidProfile);

      // Assertions
      expect(result).toBe(false);
    });

    it('should reject a profile without email', () => {
      // Create an invalid profile missing email
      const invalidProfile = {
        providerId: 'provider-id-123',
        provider: 'google',
        firstName: 'Test',
        lastName: 'User',
      } as NormalizedProfile;

      // Validate the profile
      const result = validateNormalizedProfile(invalidProfile);

      // Assertions
      expect(result).toBe(false);
    });

    it('should reject a profile without any name fields', () => {
      // Create an invalid profile missing all name fields
      const invalidProfile = {
        providerId: 'provider-id-123',
        provider: 'google',
        email: 'test@example.com',
      } as NormalizedProfile;

      // Validate the profile
      const result = validateNormalizedProfile(invalidProfile);

      // Assertions
      expect(result).toBe(false);
    });

    it('should accept a profile with only displayName', () => {
      // Create a profile with only displayName
      const profileWithDisplayName = {
        providerId: 'provider-id-123',
        provider: 'google',
        email: 'test@example.com',
        displayName: 'Test User',
        firstName: '',
      };

      // Validate the profile
      const result = validateNormalizedProfile(profileWithDisplayName as NormalizedProfile);

      // Assertions
      expect(result).toBe(true);
    });
  });



  describe('NormalizedProfileSchema', () => {
    it('should validate a complete profile', () => {
      // Create a complete normalized profile
      const completeProfile = {
        providerId: 'provider-id-123',
        provider: 'google',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      // Validate the profile
      const result = NormalizedProfileSchema.safeParse(completeProfile);

      // Assertions
      expect(result.success).toBe(true);
    });

    it('should validate a profile with minimal required fields', () => {
      // Create a minimal normalized profile
      const minimalProfile = {
        providerId: 'provider-id-123',
        provider: 'google',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: '',
      };

      // Validate the profile
      const result = NormalizedProfileSchema.safeParse(minimalProfile);

      // Assertions
      expect(result.success).toBe(true);
    });

    it('should reject a profile without providerId', () => {
      // Create an invalid profile missing providerId
      const invalidProfile = {
        provider: 'google',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      // Validate the profile
      const result = NormalizedProfileSchema.safeParse(invalidProfile);

      // Assertions
      expect(result.success).toBe(false);
    });

    it('should reject a profile without provider', () => {
      // Create an invalid profile missing provider
      const invalidProfile = {
        providerId: 'provider-id-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      // Validate the profile
      const result = NormalizedProfileSchema.safeParse(invalidProfile);

      // Assertions
      expect(result.success).toBe(false);
    });

    it('should reject a profile without email', () => {
      // Create an invalid profile missing email
      const invalidProfile = {
        providerId: 'provider-id-123',
        provider: 'google',
        firstName: 'Test',
        lastName: 'User',
      };

      // Validate the profile
      const result = NormalizedProfileSchema.safeParse(invalidProfile);

      // Assertions
      expect(result.success).toBe(false);
    });

    it('should reject a profile without any name fields', () => {
      // Create an invalid profile missing all name fields
      const invalidProfile = {
        providerId: 'provider-id-123',
        provider: 'google',
        email: 'test@example.com',
      };

      // Validate the profile
      const result = NormalizedProfileSchema.safeParse(invalidProfile);

      // Assertions
      expect(result.success).toBe(false);
    });

    it('should accept a profile with only displayName', () => {
      // Create a profile with only displayName
      const profileWithDisplayName = {
        providerId: 'provider-id-123',
        provider: 'google',
        email: 'test@example.com',
        displayName: 'Test User',
        firstName: '',
        lastName: '',
      };

      // Validate the profile
      const result = NormalizedProfileSchema.safeParse(profileWithDisplayName);

      // Assertions
      expect(result.success).toBe(true);
    });
  });

  describe('RelaxedNormalizedProfileSchema', () => {
    it('should validate a complete profile', () => {
      // Create a complete normalized profile
      const completeProfile = {
        providerId: 'provider-id-123',
        provider: 'google',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      // Validate the profile
      const result = RelaxedNormalizedProfileSchema.safeParse(completeProfile);

      // Assertions
      expect(result.success).toBe(true);
    });

    it('should validate a profile with only provider and providerId', () => {
      // Create a minimal normalized profile
      const minimalProfile = {
        providerId: 'provider-id-123',
        provider: 'google',
      };

      // Validate the profile
      const result = RelaxedNormalizedProfileSchema.safeParse(minimalProfile);

      // Assertions
      expect(result.success).toBe(true);
    });

    it('should reject a profile without providerId', () => {
      // Create an invalid profile missing providerId
      const invalidProfile = {
        provider: 'google',
      };

      // Validate the profile
      const result = RelaxedNormalizedProfileSchema.safeParse(invalidProfile);

      // Assertions
      expect(result.success).toBe(false);
    });

    it('should reject a profile without provider', () => {
      // Create an invalid profile missing provider
      const invalidProfile = {
        providerId: 'provider-id-123',
      };

      // Validate the profile
      const result = RelaxedNormalizedProfileSchema.safeParse(invalidProfile);

      // Assertions
      expect(result.success).toBe(false);
    });
  });
});