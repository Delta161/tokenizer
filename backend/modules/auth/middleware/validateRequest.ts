import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import logger from '../logger.js';

/**
 * Middleware to validate request body against a Zod schema
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn({
          message: 'Validation error',
          path: req.path,
          method: req.method,
          errors: error.errors,
          userId: (req as any).user?.id
        });

        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'The request data failed validation',
          details: error.errors
        });
      }

      logger.error({
        message: 'Unexpected validation error',
        path: req.path,
        method: req.method,
        error,
        userId: (req as any).user?.id
      });

      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'An unexpected error occurred during validation'
      });
    }
  };
};

/**
 * Middleware to validate request parameters against a Zod schema
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn({
          message: 'Parameter validation error',
          path: req.path,
          method: req.method,
          errors: error.errors,
          userId: (req as any).user?.id
        });

        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'The request parameters failed validation',
          details: error.errors
        });
      }

      logger.error({
        message: 'Unexpected parameter validation error',
        path: req.path,
        method: req.method,
        error,
        userId: (req as any).user?.id
      });

      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'An unexpected error occurred during parameter validation'
      });
    }
  };
};

/**
 * Middleware to validate request query against a Zod schema
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn({
          message: 'Query validation error',
          path: req.path,
          method: req.method,
          errors: error.errors,
          userId: (req as any).user?.id
        });

        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'The request query parameters failed validation',
          details: error.errors
        });
      }

      logger.error({
        message: 'Unexpected query validation error',
        path: req.path,
        method: req.method,
        error,
        userId: (req as any).user?.id
      });

      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'An unexpected error occurred during query validation'
      });
    }
  };
};