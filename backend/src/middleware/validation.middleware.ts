/**
 * Validation Middleware
 * Provides middleware functions for request validation
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Type alias for Express types
type ParamsDictionary = Record<string, string>;
type ParsedQs = Record<string, any>;

/**
 * Validates request body against a Zod schema
 * @param schema - Zod schema to validate against
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validation = schema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Invalid request body',
          details: validation.error.issues
        });
        return;
      }
      
      // Replace request body with validated data
      req.body = validation.data;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Validation middleware error'
      });
    }
  };
};

/**
 * Validates request parameters against a Zod schema
 * @param schema - Zod schema to validate against
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validation = schema.safeParse(req.params);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Invalid request parameters',
          details: validation.error.issues
        });
        return;
      }
      
      // Replace request params with validated data
      req.params = validation.data as ParamsDictionary;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Validation middleware error'
      });
    }
  };
};

/**
 * Validates request query against a Zod schema
 * @param schema - Zod schema to validate against
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validation = schema.safeParse(req.query);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Invalid query parameters',
          details: validation.error.issues
        });
        return;
      }
      
      // Replace request query with validated data
      req.query = validation.data as ParsedQs;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Validation middleware error'
      });
    }
  };
};