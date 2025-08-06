/**
 * Monitoring Middleware Unit Tests
 * Tests for request monitoring and security detection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { 
  requestMonitoring,
  logSecurityEvent,
  getMetrics,
  getMetricsSummary,
  resetMetrics,
  suspiciousActivityDetection
} from '@modules/accounts/middleware/monitoring.middleware';

// Mock dependencies
vi.mock('@modules/accounts/utils/accounts.logger', () => ({
  accountsLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('@utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('Monitoring Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let originalEnd: any;

  beforeEach(() => {
    // Reset metrics before each test
    resetMetrics();

    mockReq = {
      method: 'GET',
      path: '/test',
      route: { path: '/test' },
      originalUrl: '/test',
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
      user: { id: 'user-123' }
    };
    
    originalEnd = vi.fn();
    mockRes = {
      statusCode: 200,
      end: originalEnd
    };
    
    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetMetrics();
  });

  describe('Request Monitoring', () => {
    it('should track successful requests', async () => {
      return new Promise<void>((resolve) => {
        // Override end to simulate response completion
        const mockEnd = vi.fn().mockImplementation(function(this: Response, ...args) {
          // Simulate response completion after a delay
          setTimeout(() => {
            const metrics = getMetrics();
            expect(metrics.totalRequests).toBe(1);
            expect(metrics.successfulRequests).toBe(1);
            expect(metrics.failedRequests).toBe(0);
            resolve();
          }, 10);
          
          return originalEnd.apply(this, args);
        });

        mockRes.end = mockEnd;
        mockRes.statusCode = 200;

        requestMonitoring(mockReq as Request, mockRes as Response, mockNext);
        
        // Simulate response completion
        (mockRes.end as any)();
        
        expect(mockNext).toHaveBeenCalled();
      });
    });

    it('should track failed requests', async () => {
      return new Promise<void>((resolve) => {
        const mockEnd = vi.fn().mockImplementation(function(this: Response, ...args) {
          setTimeout(() => {
            const metrics = getMetrics();
            expect(metrics.totalRequests).toBe(1);
            expect(metrics.successfulRequests).toBe(0);
            expect(metrics.failedRequests).toBe(1);
            resolve();
          }, 10);
          
          return originalEnd.apply(this, args);
        });

        mockRes.end = mockEnd;
        mockRes.statusCode = 500;

        requestMonitoring(mockReq as Request, mockRes as Response, mockNext);
        
        // Simulate response completion
        (mockRes.end as any)();
      });
    });

    it('should track endpoint-specific metrics', async () => {
      return new Promise<void>((resolve) => {
        const mockEnd = vi.fn().mockImplementation(function(this: Response, ...args) {
          setTimeout(() => {
            const metrics = getMetrics();
            const endpointKey = 'GET:/test';
            expect(metrics.endpointMetrics.has(endpointKey)).toBe(true);
            
            const endpointMetric = metrics.endpointMetrics.get(endpointKey);
            expect(endpointMetric?.requestCount).toBe(1);
            expect(endpointMetric?.endpoint).toBe('/test');
            expect(endpointMetric?.method).toBe('GET');
            resolve();
          }, 10);
          
          return originalEnd.apply(this, args);
        });

        mockRes.end = mockEnd;
        mockRes.statusCode = 200;

        requestMonitoring(mockReq as Request, mockRes as Response, mockNext);
        (mockRes.end as any)();
      });
    });

    it('should calculate response times', async () => {
      return new Promise<void>((resolve) => {
        const mockEnd = vi.fn().mockImplementation(function(this: Response, ...args) {
          setTimeout(() => {
            const metrics = getMetrics();
            expect(metrics.averageResponseTime).toBeGreaterThan(0);
            resolve();
          }, 50); // Add delay to ensure response time is calculated
          
          return originalEnd.apply(this, args);
        });

        mockRes.end = mockEnd;
        mockRes.statusCode = 200;

        requestMonitoring(mockReq as Request, mockRes as Response, mockNext);
        
        setTimeout(() => {
          (mockRes.end as any)();
        }, 10); // Add delay before ending response
      });
    });
  });

  describe('Security Event Logging', () => {
    it('should log security events', () => {
      logSecurityEvent('SUSPICIOUS_ACTIVITY', mockReq as Request, {
        reason: 'Test security event'
      });

      const metrics = getMetrics();
      expect(metrics.securityEvents.length).toBe(1);
      
      const event = metrics.securityEvents[0];
      expect(event.type).toBe('SUSPICIOUS_ACTIVITY');
      expect(event.ip).toBe('127.0.0.1');
      expect(event.userId).toBe('user-123');
      expect(event.details.reason).toBe('Test security event');
    });

    it('should limit security events to 1000', () => {
      // Add more than 1000 security events
      for (let i = 0; i < 1500; i++) {
        logSecurityEvent('RATE_LIMIT_EXCEEDED', mockReq as Request);
      }

      const metrics = getMetrics();
      expect(metrics.securityEvents.length).toBe(1000);
    });
  });

  describe('Suspicious Activity Detection', () => {
    it('should detect path traversal attempts', () => {
      mockReq.originalUrl = '/test/../../../etc/passwd';

      suspiciousActivityDetection(mockReq as Request, mockRes as Response, mockNext);

      const metrics = getMetrics();
      expect(metrics.securityEvents.length).toBe(1);
      expect(metrics.securityEvents[0].type).toBe('SUSPICIOUS_ACTIVITY');
    });

    it('should detect XSS attempts', () => {
      mockReq.originalUrl = '/test?param=<script>alert("xss")</script>';

      suspiciousActivityDetection(mockReq as Request, mockRes as Response, mockNext);

      const metrics = getMetrics();
      expect(metrics.securityEvents.length).toBe(1);
      expect(metrics.securityEvents[0].type).toBe('SUSPICIOUS_ACTIVITY');
    });

    it('should detect SQL injection attempts', () => {
      mockReq.originalUrl = '/test?param=1 UNION SELECT * FROM users';

      suspiciousActivityDetection(mockReq as Request, mockRes as Response, mockNext);

      const metrics = getMetrics();
      expect(metrics.securityEvents.length).toBe(1);
      expect(metrics.securityEvents[0].type).toBe('SUSPICIOUS_ACTIVITY');
    });

    it('should allow normal requests', () => {
      mockReq.originalUrl = '/test?param=normalvalue';

      suspiciousActivityDetection(mockReq as Request, mockRes as Response, mockNext);

      const metrics = getMetrics();
      expect(metrics.securityEvents.length).toBe(0);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Metrics Functions', () => {
    beforeEach(() => {
      // Add some test data
      logSecurityEvent('RATE_LIMIT_EXCEEDED', mockReq as Request);
      logSecurityEvent('FAILED_AUTH', mockReq as Request);
    });

    it('should return metrics summary', () => {
      const summary = getMetricsSummary();

      expect(summary).toHaveProperty('uptime');
      expect(summary).toHaveProperty('totalRequests');
      expect(summary).toHaveProperty('successRate');
      expect(summary).toHaveProperty('averageResponseTime');
      expect(summary).toHaveProperty('failedRequests');
      expect(summary).toHaveProperty('securityEventsCount');
      expect(summary).toHaveProperty('topEndpoints');
      expect(summary).toHaveProperty('recentSecurityEvents');

      expect(summary.securityEventsCount).toBe(2);
      expect(summary.recentSecurityEvents).toHaveLength(2);
    });

    it('should return detailed metrics', () => {
      const metrics = getMetrics();

      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('successfulRequests');
      expect(metrics).toHaveProperty('failedRequests');
      expect(metrics).toHaveProperty('averageResponseTime');
      expect(metrics).toHaveProperty('endpointMetrics');
      expect(metrics).toHaveProperty('securityEvents');
      expect(metrics).toHaveProperty('lastReset');

      expect(metrics.endpointMetrics).toBeInstanceOf(Map);
      expect(Array.isArray(metrics.securityEvents)).toBe(true);
    });

    it('should reset metrics correctly', () => {
      // Add some data first
      logSecurityEvent('SUSPICIOUS_ACTIVITY', mockReq as Request);
      
      const beforeReset = getMetrics();
      expect(beforeReset.securityEvents.length).toBe(3); // 2 from beforeEach + 1 new

      resetMetrics();

      const afterReset = getMetrics();
      expect(afterReset.totalRequests).toBe(0);
      expect(afterReset.successfulRequests).toBe(0);
      expect(afterReset.failedRequests).toBe(0);
      expect(afterReset.averageResponseTime).toBe(0);
      expect(afterReset.endpointMetrics.size).toBe(0);
      expect(afterReset.securityEvents.length).toBe(0);
    });
  });
});
