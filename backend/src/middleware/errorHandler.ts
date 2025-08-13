/**
 * Error Handler Middleware
 * Handles errors in a consistent way using http-errors
 */

import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { logger } from '../utils/logger';

/**
 * Check if error is an HTTP error from http-errors package
 */
const isHttpError = (err: any): err is createError.HttpError => {
  return err && typeof err.status === 'number' && typeof err.statusCode === 'number';
};

/**
 * Error handler middleware
 */
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  // Default error status and message
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let details: any = {};

  // Handle HTTP errors from http-errors package
  if (isHttpError(err)) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = true;
    
    // Set error code based on status code
    switch (statusCode) {
      case 400: errorCode = 'BAD_REQUEST'; break;
      case 401: errorCode = 'UNAUTHORIZED'; break;
      case 403: errorCode = 'FORBIDDEN'; break;
      case 404: errorCode = 'NOT_FOUND'; break;
      case 409: errorCode = 'CONFLICT'; break;
      default: errorCode = `ERROR_${statusCode}`;
    }
    
    // Extract additional details if available
    if ((err as any).details) {
      details = (err as any).details;
    }
  } else if (err.name === 'ZodError') {
    // Handle validation errors
    statusCode = 400;
    message = 'Validation Error';
    errorCode = 'VALIDATION_ERROR';
    isOperational = true;
    details = (err as any).format?.() || {};
  } else if (err.name === 'AuthenticationError') {
    // Handle authentication errors
    statusCode = 401;
    message = 'Authentication failed';
    errorCode = 'AUTH_ERROR';
    isOperational = true;
  } else if (err.name === 'TokenExpiredError') {
    // Handle authentication expiration
    statusCode = 401;
    message = 'Token expired';
    errorCode = 'TOKEN_EXPIRED';
    isOperational = true;
  } else if (err.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma known errors
    statusCode = 400;
    message = 'Database operation failed';
    errorCode = 'DATABASE_ERROR';
    isOperational = true;
    details = {
      code: (err as any).code,
      meta: (err as any).meta
    };
  }

  // Log error
  if (isOperational) {
    logger.warn(`${statusCode} - ${errorCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  } else {
    logger.error(`${err.name}: ${err.message}`, { stack: err.stack });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    details: Object.keys(details).length > 0 ? details : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Not found middleware
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const err = createError(404, `Not Found - ${req.originalUrl}`);
  next(err);
};

/**
 * Interface for extended error details
 */
export interface ErrorDetails {
  [key: string]: any;
}

/**
 * Helper function to create an HTTP error with additional details
 */
const createErrorWithDetails = (statusCode: number, message: string, errorCode: string, details?: ErrorDetails) => {
  const error = createError(statusCode, message);
  (error as any).errorCode = errorCode;
  if (details) {
    (error as any).details = details;
  }
  return error;
};

/**
 * Helper functions to create common HTTP errors with additional context
 */
export const createBadRequest = (message?: string, errorCode?: string, details?: ErrorDetails) => 
  createErrorWithDetails(400, message || 'Bad Request', errorCode || 'BAD_REQUEST', details);

export const createUnauthorized = (message?: string, errorCode?: string, details?: ErrorDetails) => 
  createErrorWithDetails(401, message || 'Unauthorized', errorCode || 'UNAUTHORIZED', details);

export const createForbidden = (message?: string, errorCode?: string, details?: ErrorDetails) => 
  createErrorWithDetails(403, message || 'Forbidden', errorCode || 'FORBIDDEN', details);

export const createNotFound = (message?: string, errorCode?: string, details?: ErrorDetails) => 
  createErrorWithDetails(404, message || 'Not Found', errorCode || 'NOT_FOUND', details);

export const createConflict = (message?: string, errorCode?: string, details?: ErrorDetails) => 
  createErrorWithDetails(409, message || 'Conflict', errorCode || 'CONFLICT', details);

export const createInternalServerError = (message?: string, errorCode?: string, details?: ErrorDetails) => 
  createErrorWithDetails(500, message || 'Internal Server Error', errorCode || 'INTERNAL_SERVER_ERROR', details);

/**
 * Export http-errors for use in other modules
 */
export { createError };