/**
 * Performance Monitoring Middleware
 * Automatically monitors request processing time for all API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { OperationCategory } from '../utils/performance-monitor.util';
import { logger } from '@utils/logger';

// Symbol to store start time on request object
const REQUEST_START_TIME = Symbol('requestStartTime');

// Extend Express Request type to include our performance tracking
declare global {
  namespace Express {
    interface Request {
      [REQUEST_START_TIME]?: number;
      getElapsedTime?: () => number;
    }
  }
}

/**
 * Middleware to track request processing time
 * Adds timing data to the response headers and logs slow requests
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function performanceMonitorMiddleware(
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  // Mark the start time
  req[REQUEST_START_TIME] = Date.now();
  
  // Add method to get elapsed time at any point in the request lifecycle
  req.getElapsedTime = () => {
    const startTime = req[REQUEST_START_TIME];
    if (!startTime) return 0;
    return Date.now() - startTime;
  };
  
  // Track response time
  const originalEnd = res.end;
  
  // Override the end method to capture timing data
  res.end = function(...args: any[]): ReturnType<typeof originalEnd> {
    const startTime = req[REQUEST_START_TIME];
    if (startTime) {
      const duration = Date.now() - startTime;
      
      // Add timing header
      res.setHeader('X-Response-Time', `${duration}ms`);
      
      // Log slow responses (over 500ms)
      if (duration > 500) {
        logger.warn('Slow API request', {
          method: req.method,
          url: req.originalUrl,
          duration,
          userId: (req as any).user?.id,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          category: OperationCategory.REQUEST_HANDLING
        });
      }
      
      // Log very slow responses (over 2000ms)
      if (duration > 2000) {
        logger.error('Very slow API request', {
          method: req.method,
          url: req.originalUrl,
          duration,
          userId: (req as any).user?.id,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          query: req.query,
          body: req.body,
          category: OperationCategory.REQUEST_HANDLING
        });
      }
    }
    
    // Call the original end method
    return originalEnd.apply(this, args);
  };
  
  next();
}

/**
 * Creates a utility for detailed operation timing within a request
 * Provides methods to track multiple operations during a single request
 * 
 * @param req - Express request object
 * @returns Object with methods to track operations
 */
export function createRequestTracker(req: Request) {
  const operations: Array<{
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
  }> = [];
  
  return {
    /**
     * Starts timing an operation
     * 
     * @param operationName - Name of the operation
     * @returns Function to call when operation completes
     */
    startOperation(operationName: string) {
      const operation = {
        name: operationName,
        startTime: Date.now()
      };
      
      operations.push(operation);
      
      // Return function to end timing
      return () => {
        operation.endTime = Date.now();
        operation.duration = operation.endTime - operation.startTime;
        return operation.duration;
      };
    },
    
    /**
     * Gets all timed operations during this request
     * 
     * @returns Array of operations with timing data
     */
    getOperations() {
      return operations.map(op => ({
        name: op.name,
        duration: op.duration ?? (op.endTime ? op.endTime - op.startTime : Date.now() - op.startTime)
      }));
    },
    
    /**
     * Gets total request time so far
     * 
     * @returns Total milliseconds elapsed since request started
     */
    getTotalTime() {
      return req.getElapsedTime?.() ?? 0;
    }
  };
}
