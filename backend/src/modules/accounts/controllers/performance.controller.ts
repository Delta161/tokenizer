/**
 * Performance Controller
 * Provides API endpoints for viewing performance metrics
 */

import { Request, Response } from 'express';
import { 
  getRecentMetrics, 
  getPerformanceStats, 
  OperationCategory 
} from '../utils/performance-monitor.util';
import { createSuccessResponse } from '../utils/response-formatter';

/**
 * Controller for managing performance monitoring operations
 * Admin-only endpoints for monitoring system performance
 */
export class PerformanceController {
  /**
   * Get recent performance metrics
   * 
   * @param req - Express request object with query filters
   * @param res - Express response object
   * @returns Response with performance metrics data
   */
  getRecentMetrics(req: Request, res: Response): Response {
    // Parse query parameters
    const category = req.query.category as OperationCategory | undefined;
    const operationName = req.query.operation as string | undefined;
    const minDuration = req.query.minDuration ? parseInt(req.query.minDuration as string) : undefined;
    const userId = req.query.userId as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    // Get metrics
    const metrics = getRecentMetrics({
      category,
      operationName,
      minDuration,
      userId,
      limit
    });
    
    // Return standardized response
    return res.status(200).json(createSuccessResponse(
      metrics,
      'Performance metrics retrieved successfully'
    ));
  }
  
  /**
   * Get performance statistics
   * 
   * @param req - Express request object with query filters
   * @param res - Express response object
   * @returns Response with performance statistics
   */
  getPerformanceStats(req: Request, res: Response): Response {
    // Parse query parameters
    const category = req.query.category as OperationCategory | undefined;
    const operationName = req.query.operation as string | undefined;
    const timeWindow = req.query.timeWindow ? parseInt(req.query.timeWindow as string) : undefined;
    
    // Get statistics
    const stats = getPerformanceStats({
      category,
      operationName,
      timeWindow
    });
    
    // Calculate performance score (0-100)
    const performanceScore = calculatePerformanceScore(stats);
    
    // Return standardized response
    return res.status(200).json(createSuccessResponse(
      {
        ...stats,
        performanceScore
      },
      'Performance statistics retrieved successfully'
    ));
  }
  
  /**
   * Get performance dashboard data
   * Aggregates statistics for all categories
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @returns Response with dashboard data
   */
  getDashboardData(req: Request, res: Response): Response {
    // Get statistics for all categories
    const categories = Object.values(OperationCategory);
    const categoryStats = categories.map(category => ({
      category,
      stats: getPerformanceStats({ category })
    }));
    
    // Get slow operations (p95 > 500ms)
    const slowOperations = getRecentMetrics({
      minDuration: 500,
      limit: 10
    });
    
    // Return standardized response
    return res.status(200).json(createSuccessResponse(
      {
        categoryStats,
        slowOperations,
        totalOperations: categoryStats.reduce((total, c) => total + c.stats.count, 0),
        overallErrorRate: calculateOverallErrorRate(categoryStats),
        timestamp: new Date().toISOString()
      },
      'Performance dashboard data retrieved successfully'
    ));
  }
}

/**
 * Calculate performance score from stats
 * 
 * @param stats - Performance statistics
 * @returns Performance score (0-100)
 */
function calculatePerformanceScore(stats: ReturnType<typeof getPerformanceStats>): number {
  if (stats.count === 0) {
    return 100;
  }
  
  // Factors affecting performance score
  const errorFactor = Math.max(0, 1 - stats.errorRate * 2); // Error rate is double-penalized
  const speedFactor = Math.max(0, 1 - (stats.p95Duration / 2000)); // >2s is a 0 score
  
  // Calculate overall score
  const score = (errorFactor * 0.6 + speedFactor * 0.4) * 100;
  
  // Round to nearest integer and clamp between 0-100
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate overall error rate from category stats
 * 
 * @param categoryStats - Statistics by category
 * @returns Overall error rate
 */
function calculateOverallErrorRate(
  categoryStats: Array<{
    category: OperationCategory;
    stats: ReturnType<typeof getPerformanceStats>;
  }>
): number {
  const totalOperations = categoryStats.reduce((sum, c) => sum + c.stats.count, 0);
  const totalErrors = categoryStats.reduce((sum, c) => sum + c.stats.errorCount, 0);
  
  if (totalOperations === 0) {
    return 0;
  }
  return totalErrors / totalOperations;
}

// Create singleton instance
export const performanceController = new PerformanceController();
