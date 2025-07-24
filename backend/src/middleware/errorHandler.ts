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
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // Default error status and message
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Handle HTTP errors from http-errors package
  if (isHttpError(err)) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = true;
  } else if (err.name === 'ZodError') {
    // Handle validation errors
    statusCode = 400;
    message = 'Validation Error';
    isOperational = true;
  } else if (err.name === 'JsonWebTokenError') {
    // Handle JWT errors
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  } else if (err.name === 'TokenExpiredError') {
    // Handle JWT expiration
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }

  // Log error
  if (isOperational) {
    logger.warn(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  } else {
    logger.error(`${err.name}: ${err.message}`, { stack: err.stack });
  }

  // Send response
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * Not found middleware
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const err = createError(404, `Not Found - ${req.originalUrl}`);
  next(err);
};

/**
 * Helper functions to create common HTTP errors
 */
export const createBadRequest = (message?: string) => createError(400, message || 'Bad Request');
export const createUnauthorized = (message?: string) => createError(401, message || 'Unauthorized');
export const createForbidden = (message?: string) => createError(403, message || 'Forbidden');
export const createNotFound = (message?: string) => createError(404, message || 'Not Found');
export const createConflict = (message?: string) => createError(409, message || 'Conflict');
export const createInternalServerError = (message?: string) => createError(500, message || 'Internal Server Error');

/**
 * Export http-errors for use in other modules
 */
export { createError };