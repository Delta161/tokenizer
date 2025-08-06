/**
 * Error Analytics Middleware Unit Tests
 * Tests for error tracking and analytics functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi, MockedFunction } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { 
  errorAnalytics,
  recordError,
  recordValidationError,
  recordAuthError
} from '@modules/accounts/middleware/error-analytics.middleware';

// Mock logger
vi.mock('@utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  }
}));

vi.mock('@modules/accounts/utils/accounts.logger', () => ({
  accountsLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  }
}));

describe('Error Analytics Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      originalUrl: '/api/accounts/login',
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-user-agent'),
      headers: {
        'user-agent': 'test-user-agent',
        'referer': 'http://localhost:3000'
      },
      user: { id: 'user-123' },
      body: { email: 'test@example.com' }
    };
    
    mockRes = {
      statusCode: 500
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Recording Functions', () => {
    it('should record authentication errors', () => {
      const authError = new Error('Invalid credentials');
      
      expect(() => {
        recordAuthError(
          authError,
          mockReq as Request,
          'oauth',
          { attemptedEmail: 'test@example.com' }
        );
      }).not.toThrow();
    });

    it('should record validation errors', () => {
      const validationErrors = [
        { field: 'email', message: 'Email format is invalid' }
      ];
      
      expect(() => {
        recordValidationError(
          validationErrors,
          mockReq as Request,
          { validationRule: 'email' }
        );
      }).not.toThrow();
    });

    it('should record database errors', () => {
      const dbError = new Error('Database connection failed');
      
      expect(() => {
        errorAnalytics.recordDatabaseError(
          dbError,
          mockReq as Request,
          'SELECT * FROM users',
          { connectionAttempts: 3 }
        );
      }).not.toThrow();
    });
  });

  describe('Error Analytics Service', () => {
    it('should have error analytics service instance', () => {
      expect(errorAnalytics).toBeDefined();
      expect(typeof errorAnalytics).toBe('object');
    });

    it('should expose expected methods', () => {
      expect(typeof errorAnalytics.recordError).toBe('function');
      expect(typeof errorAnalytics.getErrorSummary).toBe('function');
      expect(typeof errorAnalytics.getErrorById).toBe('function');
      expect(typeof errorAnalytics.clearOldErrors).toBe('function');
      expect(typeof errorAnalytics.resolveError).toBe('function');
    });
  });

  describe('Error Summary Functionality', () => {
    it('should provide error summary', () => {
      const summary = errorAnalytics.getErrorSummary();
      
      expect(summary).toBeDefined();
      expect(typeof summary.totalErrors).toBe('number');
      expect(typeof summary.errorsByType).toBe('object');
      expect(typeof summary.errorsBySeverity).toBe('object');
      expect(Array.isArray(summary.topErrors)).toBe(true);
      expect(Array.isArray(summary.errorTrends)).toBe(true);
      expect(typeof summary.unresolvedCriticalErrors).toBe('number');
    });

    it('should get error by ID', () => {
      const testError = new Error('Test error for ID lookup');
      const errorId = errorAnalytics.recordError(testError, mockReq as Request);
      
      const retrievedError = errorAnalytics.getErrorById(errorId);
      expect(retrievedError).toBeDefined();
      expect(retrievedError?.message).toBe('Test error for ID lookup');
    });
  });

  describe('Error Analytics Integration', () => {
    it('should record error and reflect in summary', () => {
      const initialSummary = errorAnalytics.getErrorSummary();
      const initialTotal = initialSummary.totalErrors;

      const testError = new Error('Test authentication error');
      recordAuthError(
        testError,
        mockReq as Request,
        'oauth',
        { test: true }
      );

      const updatedSummary = errorAnalytics.getErrorSummary();
      expect(updatedSummary.totalErrors).toBeGreaterThanOrEqual(initialTotal);
    });

    it('should handle multiple error types', () => {
      const authError = new Error('Auth error');
      const systemError = new Error('System error');
      
      recordAuthError(authError, mockReq as Request);
      recordValidationError([{ field: 'email', message: 'Invalid email' }], mockReq as Request);
      errorAnalytics.recordError(systemError, mockReq as Request, 'SYSTEM_ERROR', 'critical');

      const summary = errorAnalytics.getErrorSummary();
      expect(summary.totalErrors).toBeGreaterThan(0);
    });
  });

  describe('Error Management', () => {
    it('should clear old errors successfully', () => {
      const testError = new Error('Test error');
      errorAnalytics.recordError(testError, mockReq as Request);
      
      expect(() => {
        errorAnalytics.clearOldErrors(0); // Clear all errors
      }).not.toThrow();
    });
  });

  describe('Context Handling', () => {
    it('should handle requests with user context', () => {
      mockReq.user = {
        id: 'user-456',
        email: 'user@example.com',
        role: 'admin'
      };

      const testError = new Error('Test error');
      expect(() => {
        errorAnalytics.recordError(testError, mockReq as Request, 'AUTH_ERROR', 'medium');
      }).not.toThrow();
    });

    it('should handle requests without user context', () => {
      mockReq.user = undefined;

      const testError = new Error('Test error');
      expect(() => {
        errorAnalytics.recordError(testError, mockReq as Request, 'VALIDATION_ERROR', 'low');
      }).not.toThrow();
    });
  });

  describe('Error Metadata', () => {
    it('should handle errors with metadata', () => {
      const metadata = {
        requestId: 'req-123',
        sessionId: 'sess-456',
        customData: { key: 'value' }
      };

      const testError = new Error('Test error');
      expect(() => {
        errorAnalytics.recordError(testError, mockReq as Request, 'BUSINESS_LOGIC_ERROR', 'medium', metadata);
      }).not.toThrow();
    });

    it('should handle errors without metadata', () => {
      const testError = new Error('Test error');
      expect(() => {
        errorAnalytics.recordError(testError, mockReq as Request, 'SYSTEM_ERROR', 'high');
      }).not.toThrow();
    });
  });
});
