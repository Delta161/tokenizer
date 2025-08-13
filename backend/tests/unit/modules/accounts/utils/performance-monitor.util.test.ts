/**
 * Performance Monitor Utils Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  measurePerformance,
  OperationCategory,
  getRecentMetrics,
  getPerformanceStats,
  clearMetrics,
} from '../../../../../src/modules/accounts/utils/performance-monitor.util';

// Mock logger
vi.mock('@utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Performance Monitoring Utilities', () => {
  beforeEach(() => {
    // Clear metrics before each test
    clearMetrics();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('measurePerformance', () => {
    it('should measure operation duration', async () => {
      // Arrange
      const operation = 'testOperation';
      const category = OperationCategory.DATABASE_READ;
      
      // Act
      const result = await measurePerformance(
        operation,
        category,
        async () => {
          // Simulate work
          await new Promise((resolve) => setTimeout(resolve, 10));
          return 'test-result';
        },
        { userId: 'user123' }
      );
      
      // Assert
      expect(result).toBe('test-result');
      
      // Check that metrics were recorded
      const metrics = getRecentMetrics({ operationName: operation });
      expect(metrics.length).toBe(1);
      expect(metrics[0].operationName).toBe(operation);
      expect(metrics[0].category).toBe(category);
      expect(metrics[0].durationMs).toBeGreaterThanOrEqual(10);
      expect(metrics[0].metadata).toEqual({ userId: 'user123' });
    });
    
    it('should handle errors and track them', async () => {
      // Arrange
      const operation = 'errorOperation';
      const category = OperationCategory.DATABASE_WRITE;
      const testError = new Error('Test error');
      
      // Act & Assert
      await expect(
        measurePerformance(
          operation,
          category,
          async () => {
            throw testError;
          }
        )
      ).rejects.toThrow(testError);
      
      // Check that error metrics were recorded
      const metrics = getRecentMetrics({ operationName: operation });
      expect(metrics.length).toBe(1);
      expect(metrics[0].operationName).toBe(operation);
      expect(metrics[0].category).toBe(category);
      expect(metrics[0].metadata?.error).toBe(true);
      expect(metrics[0].metadata?.errorMessage).toBe('Test error');
    });
  });
  
  describe('getPerformanceStats', () => {
    it('should calculate performance statistics', async () => {
      // Arrange
      const operation = 'statsOperation';
      const category = OperationCategory.EXTERNAL_API;
      
      // Create multiple operations
      await measurePerformance(operation, category, async () => { 
        await new Promise((resolve) => setTimeout(resolve, 10)); 
      });
      await measurePerformance(operation, category, async () => { 
        await new Promise((resolve) => setTimeout(resolve, 20)); 
      });
      await measurePerformance(operation, category, async () => { 
        await new Promise((resolve) => setTimeout(resolve, 30)); 
      });
      
      // Create an error
      try {
        await measurePerformance(operation, category, async () => { 
          throw new Error('Stats error');
        });
      } catch (e) {
        // Expected error
      }
      
      // Act
      const stats = getPerformanceStats({ operationName: operation });
      
      // Assert
      expect(stats.count).toBe(4);
      expect(stats.errorCount).toBe(1);
      expect(stats.errorRate).toBe(0.25);
      expect(stats.avgDuration).toBeGreaterThanOrEqual(15); // (10+20+30)/3 (excluding error)
      expect(stats.minDuration).toBeGreaterThanOrEqual(10);
      expect(stats.maxDuration).toBeGreaterThanOrEqual(30);
      expect(stats.p95Duration).toBeGreaterThanOrEqual(30);
    });
    
    it('should filter metrics by category', async () => {
      // Arrange
      await measurePerformance('op1', OperationCategory.DATABASE_READ, async () => { 
        await new Promise((resolve) => setTimeout(resolve, 10)); 
      });
      await measurePerformance('op2', OperationCategory.DATABASE_WRITE, async () => { 
        await new Promise((resolve) => setTimeout(resolve, 20)); 
      });
      
      // Act
      const readStats = getPerformanceStats({ category: OperationCategory.DATABASE_READ });
      const writeStats = getPerformanceStats({ category: OperationCategory.DATABASE_WRITE });
      
      // Assert
      expect(readStats.count).toBe(1);
      expect(writeStats.count).toBe(1);
    });
  });
});
