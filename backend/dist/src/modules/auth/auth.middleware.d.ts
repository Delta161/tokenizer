/**
 * Authentication Middleware
 * Provides middleware functions for route protection
 */
import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
/**
 * Auth Guard Middleware
 * Verifies JWT token and attaches user to request
 */
export declare const authGuard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Role Guard Middleware
 * Ensures user has required role(s)
 * @param roles - Array of allowed roles
 */
export declare const roleGuard: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map