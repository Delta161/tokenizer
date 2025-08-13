/**
 * Performance Controller Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { performanceController } from '../../../../../src/modules/accounts/controllers/performance.controller';
import * as performanceUtils from '../../../../../src/modules/accounts/utils/performance-monitor.util';

// Mock performanceUtils
vi.mock('../../../../../src/modules/accounts/utils/performance-monitor.util', () => ({
  getRecentMetrics: vi.fn(),
  getPerformanceStats: vi.fn(),
  OperationCategory: {
    DATABASE_READ: 'database_read',
    DATABASE_WRITE: 'database_write',
    AUTHENTICATION: 'authentication',
    EXTERNAL_API: 'external_api',
    FILE_OPERATION: 'file_operation',
    COMPUTATION: 'computation',
    REQUEST_HANDLING: 'request_handling'
  }
}));

describe('Performance Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock request and response
    req = {
      query: {}
    };
    
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    
    // Mock getRecentMetrics to return test data
    (performanceUtils.getRecentMetrics as any).mockReturnValue([
      {
        operationName: 'testOp',
        category: performanceUtils.OperationCategory.DATABASE_READ,
        durationMs: 150,
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Mock getPerformanceStats to return test data
    (performanceUtils.getPerformanceStats as any).mockReturnValue({
      count: 10,
      avgDuration: 100,
      minDuration: 50,
      maxDuration: 200,
      p95Duration: 180,
      errorCount: 1,
      errorRate: 0.1
    });
  });
  
  describe('getRecentMetrics', () => {
    it('should return metrics with default parameters', () => {
      // Act
      performanceController.getRecentMetrics(req as Request, res as Response);
      
      // Assert
      expect(performanceUtils.getRecentMetrics).toHaveBeenCalledWith({
        category: undefined,
        operationName: undefined,
        minDuration: undefined,
        userId: undefined,
        limit: 50
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should apply query filters correctly', () => {
      // Arrange
      req.query = {
        category: 'database_read',
        operation: 'testOp',
        minDuration: '100',
        userId: 'user123',
        limit: '20'
      };
      
      // Act
      performanceController.getRecentMetrics(req as Request, res as Response);
      
      // Assert
      expect(performanceUtils.getRecentMetrics).toHaveBeenCalledWith({
        category: 'database_read',
        operationName: 'testOp',
        minDuration: 100,
        userId: 'user123',
        limit: 20
      });
    });
  });
  
  describe('getPerformanceStats', () => {
    it('should return stats with default parameters', () => {
      // Act
      performanceController.getPerformanceStats(req as Request, res as Response);
      
      // Assert
      expect(performanceUtils.getPerformanceStats).toHaveBeenCalledWith({
        category: undefined,
        operationName: undefined,
        timeWindow: undefined
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should apply query filters correctly', () => {
      // Arrange
      req.query = {
        category: 'database_read',
        operation: 'testOp',
        timeWindow: '3600000'
      };
      
      // Act
      performanceController.getPerformanceStats(req as Request, res as Response);
      
      // Assert
      expect(performanceUtils.getPerformanceStats).toHaveBeenCalledWith({
        category: 'database_read',
        operationName: 'testOp',
        timeWindow: 3600000
      });
    });
  });
  
  describe('getDashboardData', () => {
    it('should return dashboard data with stats for all categories', () => {
      // Act
      performanceController.getDashboardData(req as Request, res as Response);
      
      // Assert
      expect(performanceUtils.getPerformanceStats).toHaveBeenCalled();
      expect(performanceUtils.getRecentMetrics).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
