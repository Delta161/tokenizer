/**
 * Auth Guard Middleware
 * Protects routes that require authentication
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
 * Role Guard Factory
 * Creates middleware to check if user has required role
 */
export declare const roleGuard: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authGuard.d.ts.map