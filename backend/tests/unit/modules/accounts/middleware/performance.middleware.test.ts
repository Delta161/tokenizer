/**
 * Performance Middleware Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { performanceMonitorMiddleware } from '../../../../../src/modules/accounts/middleware/performance.middleware';
import * as performanceUtils from '../../../../../src/modules/accounts/utils/performance-monitor.util';

// Mock performanceUtils
vi.mock('../../../../../src/modules/accounts/utils/performance-monitor.util', async () => {
  const actual = await vi.importActual('../../../../../src/modules/accounts/utils/performance-monitor.util');
  return {
    ...actual,
    measurePerformance: vi.fn().mockImplementation(async (name, category, callback) => callback()),
  };
});

describe('Performance Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup test objects
    req = { 
      method: 'GET',
      path: '/test',
      ip: '127.0.0.1',
      headers: {},
      url: '/test'
    };
    res = {
      statusCode: 200,
      on: vi.fn(),
      setHeader: vi.fn(),
      getHeader: vi.fn(),
    };
    next = vi.fn();
    
    // Mock res.on to call the 'finish' handler immediately
    (res.on as any).mockImplementation((event: string, handler: () => void) => {
      if (event === 'finish') {
        setTimeout(() => handler(), 5);
      }
      return res;
    });
  });
  
  it('should track request duration', () => {
    // Act
    performanceMonitorMiddleware(req as Request, res as Response, next);
    
    // Assert
    expect(next).toHaveBeenCalled();
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    
    // Advance timers to trigger the 'finish' event handler
    vi.advanceTimersByTime(10);
    
    // Check that performance was measured
    expect(performanceUtils.measurePerformance).toHaveBeenCalledWith(
      'HTTP_REQUEST_GET_/test',
      performanceUtils.OperationCategory.REQUEST_HANDLING,
      expect.any(Function),
      expect.objectContaining({
        method: 'GET',
        path: '/test',
        statusCode: 200,
      })
    );
  });
  
  it('should handle errors properly', () => {
    // Setup
    const error = new Error('Test middleware error');
    next.mockImplementationOnce(() => { throw error; });
    
    // Act & Assert
    expect(() => {
      performanceMonitorMiddleware(req as Request, res as Response, next);
    }).toThrow(error);
    
    // Check that performance was not measured when error happens in next()
    expect(performanceUtils.measurePerformance).not.toHaveBeenCalled();
  });
});
