/**
 * Error Handler Middleware
 * Handles errors in a consistent way
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Custom error class with status code
 */
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number, isOperational?: boolean);
}
/**
 * Error handler middleware
 */
export declare const errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
/**
 * Not found middleware
 */
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map