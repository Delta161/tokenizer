/**
 * Validation Middleware
 * Provides middleware functions for request validation using http-errors
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import createError from 'http-errors';
import { ParsedQs as ExpressQueryParams } from 'qs';

// Type alias for Express types
type ParamsDictionary = Record<string, string>;

/**
 * Validates request body against a Zod schema
 * @param schema - Zod schema to validate against
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validation = schema.safeParse(req.body);
      
      if (!validation.success) {
        next(createError(400, 'Invalid request body', {
          code: 'VALIDATION_ERROR',
          details: validation.error.issues
        }));
        return;
      }
      
      // Replace request body with validated data
      req.body = validation.data;
      next();
    } catch {
      next(createError(500, 'Validation middleware error', {
        code: 'INTERNAL_ERROR'
      }));
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
        next(createError(400, 'Invalid request parameters', {
          code: 'VALIDATION_ERROR',
          details: validation.error.issues
        }));
        return;
      }
      
      // Replace request params with validated data
      req.params = validation.data as ParamsDictionary;
      next();
    } catch {
      next(createError(500, 'Validation middleware error', {
        code: 'INTERNAL_ERROR'
      }));
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
        next(createError(400, 'Invalid query parameters', {
          code: 'VALIDATION_ERROR',
          details: validation.error.issues
        }));
        return;
      }
      
      // Replace request query with validated data
      req.query = validation.data as unknown as ExpressQueryParams;
      next();
    } catch {
      next(createError(500, 'Validation middleware error', {
        code: 'INTERNAL_ERROR'
      }));
    }
  };
};