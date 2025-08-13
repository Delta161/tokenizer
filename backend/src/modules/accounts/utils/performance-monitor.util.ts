/**
 * Performance Monitoring Utility
 * Provides standardized performance tracking for critical operations
 */

import { logger } from '@utils/logger';

// Performance thresholds in milliseconds
export enum PerformanceThreshold {
  FAST = 100,
  MEDIUM = 300,
  SLOW = 500,
  VERY_SLOW = 1000
}

// Operation categories for more granular reporting
export enum OperationCategory {
  DATABASE_READ = 'database_read',
  DATABASE_WRITE = 'database_write',
  AUTHENTICATION = 'authentication',
  EXTERNAL_API = 'external_api',
  FILE_OPERATION = 'file_operation',
  COMPUTATION = 'computation',
  REQUEST_HANDLING = 'request_handling'
}

/**
 * Performance data interface for tracking operations
 */
export interface PerformanceData {
  operationName: string;
  category: OperationCategory;
  durationMs: number;
  timestamp: string;
  resourceId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// In-memory store for recent performance metrics
// In a production environment, consider using a time-series database
const recentMetrics: PerformanceData[] = [];
const MAX_METRICS_STORED = 1000;

/**
 * Measures performance of an operation and logs if it exceeds thresholds
 * 
 * @param operationName - Name of the operation being measured
 * @param category - Category of the operation
 * @param callback - The function to measure
 * @param metadata - Additional metadata for the operation
 * @returns The result of the callback function
 */
export async function measurePerformance<T>(
  operationName: string,
  category: OperationCategory,
  callback: () => Promise<T>,
  metadata?: { userId?: string; resourceId?: string; [key: string]: any }
): Promise<T> {
  const startTime = Date.now();
  
  try {
    // Execute the operation
    const result = await callback();
    
    // Calculate duration
    const duration = Date.now() - startTime;
    
    // Record the metric
    recordMetric(operationName, category, duration, metadata);
    
    // Return the original result
    return result;
  } catch (error) {
    // Still record performance even if operation failed
    const duration = Date.now() - startTime;
    recordMetric(operationName, category, duration, { 
      ...metadata, 
      error: true, 
      errorMessage: (error as Error).message 
    });
    
    // Re-throw the error
    throw error;
  }
}

/**
 * Records a performance metric and logs if it exceeds thresholds
 * 
 * @param operationName - Name of the operation
 * @param category - Category of the operation
 * @param durationMs - Duration in milliseconds
 * @param metadata - Additional metadata
 */
function recordMetric(
  operationName: string,
  category: OperationCategory,
  durationMs: number,
  metadata?: { userId?: string; resourceId?: string; [key: string]: any }
): void {
  // Create performance data record
  const performanceData: PerformanceData = {
    operationName,
    category,
    durationMs,
    timestamp: new Date().toISOString(),
    userId: metadata?.userId,
    resourceId: metadata?.resourceId,
    metadata: metadata ? { ...metadata } : undefined
  };
  
  // Store in recent metrics
  recentMetrics.unshift(performanceData);
  if (recentMetrics.length > MAX_METRICS_STORED) {
    recentMetrics.pop();
  }
  
  // Log based on thresholds
  if (durationMs >= PerformanceThreshold.VERY_SLOW) {
    logger.warn(`VERY SLOW OPERATION: ${operationName} took ${durationMs}ms`, performanceData);
  } else if (durationMs >= PerformanceThreshold.SLOW) {
    logger.warn(`SLOW OPERATION: ${operationName} took ${durationMs}ms`, performanceData);
  } else if (durationMs >= PerformanceThreshold.MEDIUM) {
    logger.info(`MEDIUM OPERATION: ${operationName} took ${durationMs}ms`, performanceData);
  } else if (durationMs >= PerformanceThreshold.FAST) {
    logger.debug(`Operation ${operationName} took ${durationMs}ms`, performanceData);
  }
}

/**
 * Gets recent performance metrics, optionally filtered
 * 
 * @param filter - Optional filter criteria
 * @returns Filtered performance metrics
 */
export function getRecentMetrics(
  filter?: {
    category?: OperationCategory;
    operationName?: string;
    minDuration?: number;
    userId?: string;
    limit?: number;
  }
): PerformanceData[] {
  let filtered = [...recentMetrics];
  
  // Apply filters
  if (filter?.category) {
    filtered = filtered.filter(m => m.category === filter.category);
  }
  
  if (filter?.operationName) {
    filtered = filtered.filter(m => m.operationName === filter.operationName);
  }
  
  if (filter?.minDuration) {
    filtered = filtered.filter(m => m.durationMs >= filter.minDuration);
  }
  
  if (filter?.userId) {
    filtered = filtered.filter(m => m.userId === filter.userId);
  }
  
  // Apply limit
  const limit = filter?.limit || MAX_METRICS_STORED;
  return filtered.slice(0, limit);
}

/**
 * Gets performance statistics for an operation or category
 * 
 * @param filter - Filter criteria for calculating statistics
 * @returns Performance statistics
 */
export function getPerformanceStats(
  filter?: {
    category?: OperationCategory;
    operationName?: string;
    timeWindow?: number; // in milliseconds
  }
): {
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p95Duration: number;
  errorCount: number;
  errorRate: number;
} {
  let metrics = [...recentMetrics];
  
  // Apply category filter
  if (filter?.category) {
    metrics = metrics.filter(m => m.category === filter.category);
  }
  
  // Apply operation name filter
  if (filter?.operationName) {
    metrics = metrics.filter(m => m.operationName === filter.operationName);
  }
  
  // Apply time window filter
  if (filter?.timeWindow) {
    const cutoffTime = Date.now() - filter.timeWindow;
    metrics = metrics.filter(m => new Date(m.timestamp).getTime() >= cutoffTime);
  }
  
  // If no metrics match filters
  if (metrics.length === 0) {
    return {
      count: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      p95Duration: 0,
      errorCount: 0,
      errorRate: 0
    };
  }
  
  // Calculate statistics
  const durations = metrics.map(m => m.durationMs).sort((a, b) => a - b);
  const errorCount = metrics.filter(m => m.metadata?.error).length;
  
  const sum = durations.reduce((acc, val) => acc + val, 0);
  const avg = sum / durations.length;
  const min = durations[0];
  const max = durations[durations.length - 1];
  
  // Calculate 95th percentile
  const p95Index = Math.ceil(durations.length * 0.95) - 1;
  const p95 = durations[p95Index >= 0 ? p95Index : 0];
  
  return {
    count: metrics.length,
    avgDuration: avg,
    minDuration: min,
    maxDuration: max,
    p95Duration: p95,
    errorCount,
    errorRate: errorCount / metrics.length
  };
}

/**
 * Clears all performance metrics
 * Only for testing purposes
 */
export function clearMetrics(): void {
  recentMetrics.length = 0;
}
