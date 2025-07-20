/**
 * Error Handler Middleware
 * Handles errors in a consistent way
 */
import { logger } from '../utils/logger';
/**
 * Custom error class with status code
 */
export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * Error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Default error status and message
    let statusCode = 500;
    let message = 'Internal Server Error';
    let isOperational = false;
    // Handle known errors
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    }
    else if (err.name === 'ZodError') {
        // Handle validation errors
        statusCode = 400;
        message = 'Validation Error';
        isOperational = true;
    }
    else if (err.name === 'JsonWebTokenError') {
        // Handle JWT errors
        statusCode = 401;
        message = 'Invalid token';
        isOperational = true;
    }
    else if (err.name === 'TokenExpiredError') {
        // Handle JWT expiration
        statusCode = 401;
        message = 'Token expired';
        isOperational = true;
    }
    // Log error
    if (isOperational) {
        logger.warn(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }
    else {
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
export const notFoundHandler = (req, res, next) => {
    const err = new AppError(`Not Found - ${req.originalUrl}`, 404);
    next(err);
};
//# sourceMappingURL=errorHandler.js.map