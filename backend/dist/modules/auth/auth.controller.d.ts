import { Request, Response, NextFunction } from 'express';
import 'express-session';
interface RequestWithUser extends Request {
    user?: any;
    session?: any;
}
import { AuthenticatedRequest } from './requireAuth.js';
import { UserWithRole } from './auth.service.js';
/**
 * Handle successful OAuth authentication
 * This is called after successful OAuth callback
 */
export declare const handleAuthSuccess: (req: RequestWithUser, res: Response, user: UserWithRole) => Promise<void>;
/**
 * Handle OAuth authentication errors
 */
export declare const handleAuthError: (req: RequestWithUser, res: Response, errorMessage?: string) => void;
/**
 * Google OAuth callback handler
 */
export declare const googleCallback: (req: RequestWithUser, res: Response, next: NextFunction) => void;
/**
 * Azure AD OAuth callback handler
 */
export declare const azureCallback: (req: RequestWithUser, res: Response, next: NextFunction) => void;
/**
 * Logout handler
 */
export declare const logout: (req: AuthenticatedRequest, res: Response) => void;
/**
 * Get current user information
 */
export declare const getCurrentUser: (req: AuthenticatedRequest, res: Response) => void;
/**
 * Refresh token handler
 */
export declare const refreshToken: (req: RequestWithUser, res: Response) => void;
/**
 * Health check for authentication service
 */
export declare const authHealthCheck: (req: RequestWithUser, res: Response) => void;
export {};
//# sourceMappingURL=auth.controller.d.ts.map