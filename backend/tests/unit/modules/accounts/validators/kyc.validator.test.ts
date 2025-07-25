/**
 * Unit tests for KYC Validators
 */

// External packages
import { describe, it, expect } from 'vitest';

// Internal modules
import { 
  KycSubmissionSchema,
  KycUpdateSchema,
  KycUpdateSchemaWithRefinement
} from '../../../../../src/modules/accounts/validators/kyc.validator';
import { KycStatus } from '../../../../../src/modules/accounts/types/kyc.types';

describe('KYC Validators', () => {
  describe('KycSubmissionSchema', () => {
    it('should validate a valid KYC submission', () => {
      const validSubmission = {
        documentType: 'passport',
        country: 'US'
      };

      const result = KycSubmissionSchema.safeParse(validSubmission);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validSubmission);
      }
    });

    it('should reject a submission with document type exceeding max length', () => {
      const invalidSubmission = {
        documentType: 'a'.repeat(51), // 51 characters, max is 50
        country: 'US'
      };

      const result = KycSubmissionSchema.safeParse(invalidSubmission);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('documentType');
        expect(result.error.issues[0].message).toContain('50 characters or less');
      }
    });

    it('should reject a submission with invalid country code length', () => {
      const invalidSubmission = {
        documentType: 'passport',
        country: 'USA' // 3 characters, should be 2
      };

      const result = KycSubmissionSchema.safeParse(invalidSubmission);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('country');
        expect(result.error.issues[0].message).toContain('2-character');
      }
    });

    it('should reject a submission with missing fields', () => {
      const incompleteSubmission = {
        documentType: 'passport'
        // country is missing
      };

      const result = KycSubmissionSchema.safeParse(incompleteSubmission);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('country');
      }
    });
  });

  describe('KycUpdateSchemaWithRefinement', () => {
    it('should validate a valid PENDING status update', () => {
      const validUpdate = {
        status: KycStatus.PENDING
      };

      const result = KycUpdateSchemaWithRefinement.safeParse(validUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUpdate);
      }
    });

    it('should validate a valid VERIFIED status update', () => {
      const validUpdate = {
        status: KycStatus.VERIFIED
      };

      const result = KycUpdateSchemaWithRefinement.safeParse(validUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUpdate);
      }
    });

    it('should validate a valid REJECTED status update with reason', () => {
      const validUpdate = {
        status: KycStatus.REJECTED,
        rejectionReason: 'Document appears to be forged'
      };

      const result = KycUpdateSchemaWithRefinement.safeParse(validUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUpdate);
      }
    });

    it('should reject a REJECTED status update without a reason', () => {
      const invalidUpdate = {
        status: KycStatus.REJECTED
        // rejectionReason is missing
      };

      const result = KycUpdateSchemaWithRefinement.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Rejection reason is required');
      }
    });

    it('should reject a REJECTED status update with empty reason', () => {
      const invalidUpdate = {
        status: KycStatus.REJECTED,
        rejectionReason: ''
      };

      const result = KycUpdateSchemaWithRefinement.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Rejection reason is required');
      }
    });

    it('should reject an update with invalid status', () => {
      const invalidUpdate = {
        status: 'INVALID_STATUS' as KycStatus
      };

      const result = KycUpdateSchemaWithRefinement.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('status');
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });

    it('should reject an update with rejection reason exceeding max length', () => {
      const invalidUpdate = {
        status: KycStatus.REJECTED,
        rejectionReason: 'a'.repeat(501) // 501 characters, max is 500
      };

      const result = KycUpdateSchemaWithRefinement.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('rejectionReason');
      }
    });

    it('should allow null rejection reason for non-REJECTED status', () => {
      const validUpdate = {
        status: KycStatus.VERIFIED,
        rejectionReason: null
      };

      const result = KycUpdateSchemaWithRefinement.safeParse(validUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUpdate);
      }
    });
  });
});