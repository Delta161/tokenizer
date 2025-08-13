/**
 * Error Handler Utility
 * Standardized error handling for all controllers using http-errors
 * 
 * This utility provides consistent error handling across all API endpoints,
 * ensuring proper logging, status code mapping, and standardized client responses.
 */

import { Request, Response } from 'express';
import { logger } from '../logger';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import createError, { HttpError, isHttpError } from 'http-errors';

/**
 * Error types supported by the application
 */
export type AppErrorSource = 
  | Error
  | ZodError
  | PrismaClientKnownRequestError
  | PrismaClientValidationError
  | HttpError
  | unknown;

/**
 * Converts any error type to an HttpError
 * This ensures all errors are handled consistently using http-errors
 */
export function convertToHttpError(error: AppErrorSource): HttpError {
  // If already an HttpError, return as is
  if (isHttpError(error)) {
    return error;
  }
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.format();
    const errorPath = Object.keys(formattedErrors).find(key => key !== '_errors');
    
    return createError(400, `Validation error: ${errorPath ?? 'input'}`, {
      code: 'VALIDATION_ERROR',
      details: formattedErrors
    });
  }
  
  // Handle Prisma database errors
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const field = error.meta?.target as string[] || ['record'];
        return createError(409, `A ${field.join(', ')} with this value already exists`, {
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          fields: field
        });
      }
      case 'P2025':
        return createError(404, 'The requested resource was not found', {
          code: 'RESOURCE_NOT_FOUND',
          details: error.meta
        });
      case 'P2003':
        return createError(400, 'Invalid relationship reference', {
          code: 'FOREIGN_KEY_CONSTRAINT_FAILED',
          details: error.meta
        });
      default:
        return createError(500, 'An error occurred while accessing the database', {
          code: 'DATABASE_ERROR',
          prismaCode: error.code,
          details: process.env.NODE_ENV === 'production' ? undefined : error.meta
        });
    }
  }
  
  // Handle Prisma validation errors
  if (error instanceof PrismaClientValidationError) {
    return createError(400, 'Invalid data provided', {
      code: 'DATABASE_VALIDATION_ERROR',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    // Determine if error has a status code property
    const hasStatus = 'status' in error;
    const status = hasStatus ? (error as unknown as { status: number }).status : 500;
    const message = process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message || 'An unexpected error occurred';
    
    return createError(status, message, {
      code: 'SERVER_ERROR',
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
  
  // Fallback for unknown error types
  return createError(500, 'An unexpected error occurred', {
    code: 'UNKNOWN_ERROR'
  });
}

/**
 * Generates an error code for tracking/reference
 */
export function getErrorCode(error: AppErrorSource): string {
  // Generate a timestamp-based error reference code
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  
  // Use error name as prefix if available
  let prefix = 'ERR';
  if (error instanceof Error) {
    prefix = error.name.substring(0, 3).toUpperCase();
  }
  
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Standard controller error handler
 * 
 * @param error The error that occurred
 * @param req Express request object
 * @param res Express response object
 * @param operation Description of the operation that failed
 * @returns Express response with standardized error format
 */
export const handleControllerError = (
  error: AppErrorSource,
  req: Request,
  res: Response,
  operation: string
): Response => {
  // Extract user info from session if available
  let userId = 'anonymous';
  
  if (req.user && typeof req.user === 'object') {
    const user = req.user as Record<string, unknown>;
    if ('id' in user && user.id) {
      userId = String(user.id);
    }
  } else if (req.session && typeof req.session === 'object' && 'passport' in req.session) {
    const passport = req.session.passport as Record<string, unknown> | undefined;
    if (passport && typeof passport === 'object' && 'user' in passport) {
      userId = String(passport.user);
    }
  }
  
  // Convert to HttpError
  const httpError = convertToHttpError(error);
  
  // Log the error with context
  logger.error(`${operation} failed`, { 
    error: {
      message: httpError.message,
      name: httpError.name,
      status: httpError.status,
      stack: httpError.stack,
      // Include extra properties if they exist and are exposed
      ...(httpError.expose && 'details' in httpError 
        ? { details: (httpError as unknown as { details: unknown }).details }
        : {})
    },
    userId,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  // Generate tracking code
  const code = getErrorCode(error);
  
  // Return standardized error response
  return res.status(httpError.status).json({
    success: false,
    error: {
      message: httpError.message,
      statusCode: httpError.status,
      code
    },
    timestamp: new Date().toISOString()
  });
};
